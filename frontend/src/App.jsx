// App.jsx
import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Chào bạn 👋! Tôi có thể giúp gì cho bạn hôm nay?",
    },
  ]);

  return (
    <div className="min-h-screen bg-[#f5f5fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md sm:max-w-lg h-[700px] bg-white/10 shadow-lg rounded-xl p-4 flex flex-col">
        <ChatWindow messages={messages} setMessages={setMessages} />
      </div>
    </div>
  );
}
