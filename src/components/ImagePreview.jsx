import React, { useState, useRef, useEffect } from 'react';

const ImagePreview = ({ originalImage, enhancedImage }) => {
  const [isComparing, setIsComparing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  
  const handleDownload = () => {
    if (enhancedImage) {
      const link = document.createElement('a');
      link.href = enhancedImage;
      link.download = 'enhanced-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handleSliderMouseDown = (e) => {
    if (!isComparing || !sliderRef.current || !containerRef.current) return;
    
    const handleMouseMove = (moveEvent) => {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPosition = ((moveEvent.clientX - containerRect.left) / containerRect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, newPosition)));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Reset states when images change
  useEffect(() => {
    setIsComparing(false);
    setShowOriginal(false);
    setSliderPosition(50);
  }, [originalImage, enhancedImage]);

  if (!originalImage && !enhancedImage) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="text-center p-6">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No image to preview</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload an image and enhance it to see the results here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-800" ref={containerRef}>
        {/* Original Image */}
        {(showOriginal || isComparing) && originalImage && (
          <div 
            className="absolute inset-0 bg-contain bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${originalImage})`,
              ...(isComparing ? { 
                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` 
              } : {})
            }}
          />
        )}
        
        {/* Enhanced Image */}
        {(!showOriginal || isComparing) && enhancedImage && (
          <div 
            className="absolute inset-0 bg-contain bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${enhancedImage})`,
              ...(isComparing ? {} : {})
            }}
          />
        )}
        
        {/* Comparison Slider */}
        {isComparing && (
          <>
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
              style={{ left: `${sliderPosition}%` }}
              ref={sliderRef}
              onMouseDown={handleSliderMouseDown}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">Original</div>
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">Enhanced</div>
          </>
        )}
      </div>
      
      {/* Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => { setIsComparing(false); setShowOriginal(!showOriginal); }}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              showOriginal && !isComparing 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showOriginal && !isComparing ? 'Original' : 'Show Original'}
          </button>
          
          <button
            onClick={() => { setShowOriginal(false); setIsComparing(!isComparing); }}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              isComparing 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isComparing ? 'Exit Compare' : 'Compare'}
          </button>
        </div>
        
        {enhancedImage && (
          <button
            onClick={handleDownload}
            className="flex items-center px-3 py-2 text-sm rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        )}
      </div>
      
      {/* Thumbnails */}
      {originalImage && enhancedImage && (
        <div className="mt-3 flex space-x-2">
          <div 
            className={`w-16 h-16 rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
              (showOriginal && !isComparing) ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => { setIsComparing(false); setShowOriginal(true); }}
          >
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${originalImage})` }}
            />
          </div>
          
          <div 
            className={`w-16 h-16 rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
              (!showOriginal && !isComparing) ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => { setIsComparing(false); setShowOriginal(false); }}
          >
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${enhancedImage})` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;