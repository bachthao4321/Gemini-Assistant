## Chạy sever local
@echo off
call conda activate chatbot-env
cd ../backend
uvicorn main:app --reload --port 8000
