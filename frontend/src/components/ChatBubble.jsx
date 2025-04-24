import React from "react";

export default function ChatBubble({ message }) {
  const isUser = message.role === "user";

  const parseMessageWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s\)\]\[<>,"']+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        const matched = part.match(urlRegex)?.[0];
        const trailing = part.slice(matched.length);
        return (
          <React.Fragment key={i}>
            <a
              href={matched}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-all"
            >
              {matched}
            </a>
            {trailing}
          </React.Fragment>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-1`}>
      {!isUser && <img src="/bot.png" alt="bot" className="h-8 rounded-full" />}
      <div
        className={`max-w-[70%] px-4 py-2 rounded-xl text-sm shadow-sm whitespace-pre-wrap ${
          isUser
            ? "bg-[#ffe4e1] text-black rounded-tr-none"
            : "bg-white text-black border rounded-tl-none"
        }`}
      >
        {message.content === "..." ? (
          <span className="dot-typing" />
        ) : (
          parseMessageWithLinks(message.content)
        )}
      </div>
      {isUser && <img src="/user.png" alt="you" className="h-8 rounded-full" />}
    </div>
  );
}
