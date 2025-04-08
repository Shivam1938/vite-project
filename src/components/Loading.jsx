function Loading({ progress = 0 }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-95 backdrop-blur-sm z-10 rounded-xl shadow-inner">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-100 border-opacity-60 rounded-full"></div>
        <div 
          className="absolute top-0 left-0 w-20 h-20 border-4 border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent rounded-full animate-spin"
          style={{ animationDuration: '1s' }}
        ></div>
        <div className="absolute top-0 left-0 w-20 h-20 flex items-center justify-center text-indigo-600 font-bold">
          {Math.round(progress)}%
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xl font-medium bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Enhancing Image...
        </p>
        
        <div className="w-64 h-2 bg-indigo-100 rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="mt-3 text-gray-600">
          {progress < 30 && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span>Loading image...</span>
            </div>
          )}
          {progress >= 30 && progress < 60 && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
              </svg>
              <span>Applying color enhancements...</span>
            </div>
          )}
          {progress >= 60 && progress < 85 && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <span>Adding sharpness and detail...</span>
            </div>
          )}
          {progress >= 85 && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <span>Upscaling resolution...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Loading
