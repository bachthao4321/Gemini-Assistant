import React from "react";
import FileUploader from "./FileUploader";

export default function ChatInput({
  input,
  setInput,
  handleSend,
  isStreaming,
  handleUploadPDF,
}) {
  return (
    <div className="flex items-center mt-4 border-t pt-2">
      <input
        className="flex-1 p-3 rounded-full bg-white border mr-2 outline-none text-sm"
        placeholder="Type a new message here"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={isStreaming}
      />

      <FileUploader onUpload={handleUploadPDF} />

      <button
        className="bg-black text-white px-4 py-2 rounded-full"
        onClick={handleSend}
        disabled={isStreaming}
      >
        ➤
      </button>
    </div>
  );
}
