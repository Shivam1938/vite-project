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
    if (!image || !canvas || !upscaleCanvas) return
    
    try {
      setIsLoading(true)
      setProgress(10)
      
      // Create a temporary URL for the original image
      const originalUrl = URL.createObjectURL(image)
      
      // Load the image into our canvas for processing
      const img = new Image()
      
      img.onload = () => {
        // Update progress
        setProgress(30)
        
        // Set canvas dimensions to match image
        canvas.width = img.width
        canvas.height = img.height
        
        // Get canvas context for drawing
        const ctx = canvas.getContext('2d')
        
        // Draw the original image to canvas
        ctx.drawImage(img, 0, 0)
        
        // Get image data for manipulation
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Update progress
        setProgress(50)
        
        // 1. Apply vibrance and saturation enhancement
        for (let i = 0; i < data.length; i += 4) {
          // Get RGB values
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]
          
          // Calculate luminance
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b
          
          // Apply contrast (more dramatic)
          const contrastFactor = 1.75 // Higher value = more contrast
          r = Math.min(255, Math.max(0, (r - luminance) * contrastFactor + luminance))
          g = Math.min(255, Math.max(0, (g - luminance) * contrastFactor + luminance))
          b = Math.min(255, Math.max(0, (b - luminance) * contrastFactor + luminance))
          
          // Apply vibrance (boost least saturated colors more)
          const avg = (r + g + b) / 3
          const max = Math.max(r, g, b)
          const saturation = (max - Math.min(r, g, b)) / max || 0
          const vibranceFactor = 1.8 // Vibrance intensity
          
          // Apply more vibrance to less saturated pixels
          const satBoost = (1 - saturation) * vibranceFactor
          
          // Apply the boost with color balancing
          r += (r === max ? 0 : (max - r) * satBoost)
          g += (g === max ? 0 : (max - g) * satBoost)
          b += (b === max ? 0 : (max - b) * satBoost)
          
          // Apply color temperature shift (slightly warmer)
          r = Math.min(255, r * 1.08)
          b = Math.min(255, b * 0.92)
          
          // Store the enhanced colors
          data[i] = r
          data[i + 1] = g
          data[i + 2] = b
        }
        
        // Update progress
        setProgress(70)
        
        // 2. Apply sharpening effect
        sharpen(data, canvas.width, canvas.height, 80)
        
        // 3. Apply slight vignette effect
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY)
        
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4
            
            // Distance from center (0 to 1)
            const distX = x - centerX
            const distY = y - centerY
            const dist = Math.sqrt(distX * distX + distY * distY) / maxDist
            
            // Apply vignette only to edges (> 75% distance from center)
            if (dist > 0.75) {
              // Calculate vignette factor (1 at 75% distance, 0.8 at edge)
              const vignette = 1 - Math.min(1, (dist - 0.75) * 4 * 0.25)
              data[idx] *= vignette
              data[idx + 1] *= vignette
              data[idx + 2] *= vignette
            }
          }
        }
        
        // Put the enhanced image data back on the canvas
        ctx.putImageData(imageData, 0, 0)
        
        // Update progress
        setProgress(85)
        
        // 4. Upscale the image by 2x
        const scaleFactor = 2.0
        
        // Only upscale if the image is small enough (avoid memory issues)
        const maxDimension = Math.max(img.width, img.height)
        const shouldUpscale = maxDimension < 1800 // Only upscale if under 1800px
        
        let finalCanvas = canvas
        
        if (shouldUpscale) {
          // Use our upscaling function
          finalCanvas = upscaleImage(ctx, canvas.width, canvas.height, upscaleCanvas, scaleFactor)
        }
        
        // Convert canvas to image URL (higher quality)
        const enhancedUrl = finalCanvas.toDataURL('image/jpeg', 0.95)
        
        // Set the enhanced image URL
        setEnhancedImage(enhancedUrl)
        setProgress(100)
        setIsLoading(false)
        
        // Cleanup original URL
        URL.revokeObjectURL(originalUrl)
      }
      
      img.onerror = () => {
        setError('Failed to load image for processing.')
        setIsLoading(false)
        URL.revokeObjectURL(originalUrl)
      }
      
      // Start loading the image
      img.src = originalUrl
      
    } catch (err) {
      console.error('Enhancement error:', err)
      setError(`Failed to enhance image: ${err.message}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden transform transition-all">
      <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <ImageUpload 
          onImageUpload={handleImageUpload} 
          onEnhance={enhanceImage}
          hasImage={Boolean(image)}
          disabled={isLoading}
        />
        
        <div className="relative min-h-[400px] md:min-h-0">
          {isLoading && <Loading progress={progress} />}
          {!isLoading && (
            <ImagePreview 
              originalImage={image ? URL.createObjectURL(image) : null}
              enhancedImage={enhancedImage}
            />
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
  
export default Home
  