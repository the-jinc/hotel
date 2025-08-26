import React, { useState, useRef } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

export default function ImageUploader({ 
  onFileSelect, 
  initialImages = [], 
  label = "Upload images", 
  multiple = true 
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (files) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      if (multiple) {
        // For multiple: add to existing selection
        onFileSelect(prev => [...(prev || []), ...fileArray]);
      } else {
        // For single: replace existing
        onFileSelect(fileArray[0]);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        className={`relative w-full h-48 border-2 border-dashed rounded-lg transition-colors duration-200 cursor-pointer ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          id="image-upload"
          ref={inputRef}
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
          accept="image/*"
          multiple={multiple}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-gray-500">
          <PhotoIcon className="h-10 w-10 mb-2" />
          <p className="font-semibold">
            {multiple 
              ? "Drag & drop images here, or click to select files"
              : "Drag & drop an image here, or click to select a file"}
          </p>
          <p className="text-xs mt-1">(Max file size: 5MB per image)</p>
        </div>
      </div>
    </div>
  );
}