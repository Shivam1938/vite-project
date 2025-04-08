import React, { useState, useRef } from 'react';

const ImageUpload = ({ onImageUpload, onEnhance, hasImage, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="flex flex-col h-full">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleFileInputChange}
      />
      
      <div 
        className={`
          flex-1 flex flex-col items-center justify-center p-6 
          border-2 border-dashed rounded-xl transition-all duration-200
          min-h-[250px] cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : hasImage ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
        `}
        onClick={handleFileSelect}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <svg 
            className={`mx-auto h-12 w-12 mb-4 transition-colors ${hasImage ? 'text-green-500' : 'text-gray-400'}`} 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48" 
            aria-hidden="true"
          >
            <path 
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {hasImage ? 'Image Selected' : 'Upload an Image'}
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            {hasImage 
              ? 'Click to select a different image' 
              : 'Drag and drop or click to select an image to enhance'}
          </p>
          
          <p className="text-xs text-gray-400">
            Supports JPG, PNG, WebP
          </p>
        </div>
      </div>
      
      <button
        onClick={onEnhance}
        disabled={!hasImage || disabled}
        className={`
          mt-4 w-full rounded-lg py-3 px-4 text-white font-medium 
          transition-all duration-200 transform
          ${!hasImage || disabled 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow-md active:scale-98'}
        `}
      >
        {disabled ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enhancing...
          </div>
        ) : (
          'Enhance Image'
        )}
      </button>
    </div>
  );
};

export default ImageUpload;
  