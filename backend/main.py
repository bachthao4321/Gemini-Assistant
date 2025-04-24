from fastapi import FastAPI, Request
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel, function_tool
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from agents import function_tool
from langchain.chains.summarize import load_summarize_chain
from langchain.docstore.document import Document
from langchain_openai import ChatOpenAI
from duckduckgo_search import DDGS
import requests
from bs4 import BeautifulSoup
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.retrieval_qa.base import RetrievalQA 
from langchain_community.document_loaders import PyPDFLoader
from fastapi import UploadFile, File
from langchain.text_splitter import RecursiveCharacterTextSplitter

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

client = AsyncOpenAI(api_key=API_KEY, base_url=BASE_URL)
model = OpenAIChatCompletionsModel(model="gemini-2.0-flash", openai_client=client)

llm = ChatOpenAI(
    openai_api_key=API_KEY,
    openai_api_base=BASE_URL,
    model_name="gemini-2.0-flash"
)


@function_tool
def summarize_article_url(url: str) -> str:
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")
        paragraphs = soup.find_all("p")
        text = "\n".join(p.get_text() for p in paragraphs)

        if not text.strip():
            return "Không tìm thấy nội dung để tóm tắt."

        docs = [Document(page_content=text[:5000])]
        chain = load_summarize_chain(llm, chain_type="refine")
        summary = chain.run(docs)

        return summary

    except Exception as e:
        return f"Đã xảy ra lỗi khi tóm tắt bài viết: {str(e)}"
        
@function_tool
def search_web(query: str) -> str:
    with DDGS() as ddgs:
        results = ddgs.text(query, max_results=3)
        if not results:
            return "Không tìm thấy thông tin phù hợp."
        return "\n".join([f"- {r['title']}: {r['href']}" for r in results])

## Câu 1 và Câu 2 
agent = Agent(
    name="Gemini Assistant",
    instructions="Bạn là trợ lý AI hiểu biết, lịch sự và sáng tạo.",
    model=model,
    tools=[search_web, summarize_article_url]
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    prompt = data.get("message", "")
    response = await Runner.run(agent, prompt)
    return PlainTextResponse(content=response.final_output)


# Câu 3
pdf_context_store = {}  

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    os.makedirs("../temp", exist_ok=True)
    contents = await file.read()
    path = f"../temp/{file.filename}"
    with open(path, "wb") as f:
        f.write(contents)

    loader = PyPDFLoader(path)
    pages = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = splitter.split_documents(pages)

    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    vectorstore = FAISS.from_documents(docs, embedding_model)
    pdf_context_store["default"] = vectorstore

    return {"message": "Tải file PDF thành công."}

@app.post("/chat-pdf")
async def chat_pdf(request: Request):
    data = await request.json()
    query = data.get("message", "")

    retriever = pdf_context_store["default"].as_retriever()
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever
    )
    result = qa_chain.run(query)
    return PlainTextResponse(result)