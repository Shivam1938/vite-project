import Home from "./components/Home"

function App() {
  return (
    <div id="app" className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-10 px-4 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 mb-3">AI Image Enhancer</h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">Upload your image and transform it with professional enhancements in seconds!</p>
      </div>
      
      <Home />
      
      <footer className="mt-12 text-center">
        <p className="text-base sm:text-lg text-gray-500">
          <span className="opacity-90">Powered by</span> 
          <span className="font-semibold ml-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Boymax</span>
        </p>
      </footer>
    </div>
  )
}

export default App


