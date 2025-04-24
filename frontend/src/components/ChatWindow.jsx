import React, { useState } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";

export default function ChatWindow({ messages, setMessages }) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);

  const handleUploadPDF = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:8000/upload-pdf", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    setIsPdfMode(true);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `📄 ${file.name} đã được tải lên. Bạn có thể đặt câu hỏi về nội dung trong file.`,
      },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    const isUrlQuestion =
      input.includes("http://") || input.includes("https://");
    const endpoint = isUrlQuestion
      ? "/chat"
      : isPdfMode
      ? "/chat-pdf"
      : "/chat";

    const response = await fetch(`http://localhost:8000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let rawText = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      rawText += decoder.decode(value, { stream: true });
    }

    rawText = rawText.replace("[DONE]", "");
    let botContent = "";
    let index = 0;

    setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

    const typeNextChar = () => {
      if (index < rawText.length) {
        botContent += rawText[index++];
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: botContent,
          };
          return updated;
        });
        setTimeout(typeNextChar, 15);
      } else {
        setIsStreaming(false);
      }
    };

    typeNextChar();
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex-1 overflow-y-auto pr-1">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
      </div>
      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        isStreaming={isStreaming}
        handleUploadPDF={handleUploadPDF}
      />
    </div>
  );
}
