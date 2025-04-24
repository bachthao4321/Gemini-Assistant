import React, { useState } from "react";

export default function FileUploader({ onUpload }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    await onUpload(file);
    setIsUploading(false);
  };

  return (
    <label className="mr-2 cursor-pointer relative">
      {isUploading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      ) : (
        <img src="/icons/clip.svg" alt="attach" className="w-5 h-5" />
      )}
      <input
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </label>
  );
}
