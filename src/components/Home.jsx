import { useState, useEffect } from 'react'
import ImageUpload from "./ImageUpload"
import ImagePreview from "./ImagePreview"
import Loading from "./Loading"

function Home() {
  const [image, setImage] = useState(null)
  const [enhancedImage, setEnhancedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [canvas, setCanvas] = useState(null)
  const [upscaleCanvas, setUpscaleCanvas] = useState(null)

  useEffect(() => {
    // Create canvas elements for image processing
    const canvasElement = document.createElement('canvas')
    const upscaleCanvasElement = document.createElement('canvas')
    setCanvas(canvasElement)
    setUpscaleCanvas(upscaleCanvasElement)
  }, [])
  
  const handleImageUpload = (file) => {
    setImage(file)
    setEnhancedImage(null)
    setError(null)
    setProgress(0)
  }

  // Apply sharpening filter to image data
  const sharpen = (data, width, height, amount = 50) => {
    const tempData = new Uint8ClampedArray(data.length)
    tempData.set(data)
    
    // Sharpening kernel
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]
    
    // Apply convolution
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const offset = (y * width + x) * 4
        
        for (let c = 0; c < 3; c++) {
          let val = 0
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c
              val += tempData[idx] * kernel[(ky + 1) * 3 + (kx + 1)]
            }
          }
          // Apply sharpening with strength parameter
          const mix = amount / 100
          data[offset + c] = Math.min(255, Math.max(0, 
            tempData[offset + c] * (1 - mix) + val * mix
          ))
        }
      }
    }
    
    return data
  }

  // Bilinear interpolation for smoother upscaling
  const upscaleImage = (srcCtx, srcWidth, srcHeight, destCanvas, scaleFactor) => {
    const destWidth = Math.floor(srcWidth * scaleFactor)
    const destHeight = Math.floor(srcHeight * scaleFactor)
    
    // Set the destination canvas size
    destCanvas.width = destWidth
    destCanvas.height = destHeight
    
    const destCtx = destCanvas.getContext('2d')
    
    // Draw the scaled image using high-quality interpolation
    destCtx.imageSmoothingEnabled = true
    destCtx.imageSmoothingQuality = 'high'
    
    // First, use the browser's built-in scaling to do the rough upscale
    destCtx.drawImage(
      srcCtx.canvas,
      0, 0, srcWidth, srcHeight,
      0, 0, destWidth, destHeight
    )
    
    // Get the upscaled image data
    const destImageData = destCtx.getImageData(0, 0, destWidth, destHeight)
    const destData = destImageData.data
    
    // Apply additional sharpening to enhance details
    sharpen(destData, destWidth, destHeight, 30)
    
    // Put the sharpened upscaled image back
    destCtx.putImageData(destImageData, 0, 0)
    
    return destCanvas
  }

  const enhanceImage = async () => {
    if (!image) return
    
    try {
      setIsLoading(true)
      setProgress(10)
      
      // Convert File to base64
      const base64Image = await convertToBase64(image)
      setProgress(20)
      
      // Create request data with base64 image
      const requestData = {
        url: base64Image,
        width: "200%",  // Upscale by 2x
        height: "200%", // Upscale by 2x
        enhancements: ["denoise", "deblur", "face_enhance", "light", "color"],
        output_format: "jpeg",
        quality: 90
      }
      
      // Update progress to indicate API call is starting
      setProgress(30)
      
      // Define Deep Image API endpoint
      const apiUrl = 'https://deep-image.ai/rest_api/process'
      
      // Make API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'X-API-KEY': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      // Update progress
      setProgress(60)
      
      // Check if request was successful
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
      
      // Parse response JSON
      const data = await response.json()
      
      // Update progress
      setProgress(80)
      
      // Check if API returned a valid response
      if (data.status === 'complete' && data.result_url) {
        // Set the enhanced image URL from the API response
        setEnhancedImage(data.result_url)
        setProgress(100)
        setIsLoading(false)
      } else if (data.job) {
        // If the job is still processing, poll for the result
        await pollForResult(data.job)
      } else {
        throw new Error('API did not return a valid response')
      }
      
    } catch (err) {
      console.error('Enhancement error:', err)
      setError(`Failed to enhance image: ${err.message}`)
      setIsLoading(false)
    }
  }
  
  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  // Function to poll for results if processing takes more than 25 seconds
  const pollForResult = async (jobId) => {
    try {
      // Set polling interval (3 seconds)
      const pollInterval = 3000
      let attempts = 0
      const maxAttempts = 20 // Maximum number of attempts (60 seconds total)
      
      const checkResult = async () => {
        attempts++
        setProgress(80 + Math.min(15, attempts))
        
        // Make request to get job result
        const response = await fetch(`https://deep-image.ai/rest_api/result/${jobId}`, {
          method: 'GET',
          headers: {
            'X-API-KEY': import.meta.env.VITE_API_KEY
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to get job result: ${response.status} ${response.statusText}`)
        }
        
        const resultData = await response.json()
        
        if (resultData.status === 'complete' && resultData.result_url) {
          // Job is complete, set the enhanced image URL
          setEnhancedImage(resultData.result_url)
          setProgress(100)
          setIsLoading(false)
          return true
        } else if (attempts >= maxAttempts) {
          // Maximum attempts reached
          throw new Error('Processing timed out after 60 seconds')
        } else {
          // Job is still processing, continue polling
          setTimeout(checkResult, pollInterval)
          return false
        }
      }
      
      // Start polling
      await checkResult()
      
    } catch (err) {
      console.error('Polling error:', err)
      setError(`Failed while waiting for processing: ${err.message}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Image</h2>
          <ImageUpload 
            onImageUpload={handleImageUpload}
            onEnhance={enhanceImage}
            hasImage={!!image}
            disabled={isLoading}
          />
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <p className="text-sm">{error}</p>
              <button 
                className="text-xs text-red-600 underline mt-1"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm h-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Preview</h2>
          <div className="relative h-[400px]">
            <ImagePreview 
              originalImage={image ? URL.createObjectURL(image) : null} 
              enhancedImage={enhancedImage}
            />
            
            {isLoading && <Loading progress={progress} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
  