'use client';

import { useState, useEffect } from 'react';
import { config } from '../config';

export default function Home() {
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newImages = await Promise.all(
        Array(3).fill(null).map(async () => {
          const timestamp = new Date().getTime();
          const response = await fetch(`${config.flaskServerUrl}${config.apiEndpoints.getImage}?t=${timestamp}`);
          
          if (!response.ok) {
            throw new Error('Failed to generate image');
          }

          const blob = await response.blob();
          return URL.createObjectURL(blob);
        })
      );
      
      currentImages.forEach(url => URL.revokeObjectURL(url));
      setCurrentImages(newImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the images');
      setCurrentImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      currentImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [currentImages]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-4">
            X-Ray Image Generator
          </h1>
          <p className="text-gray-200 text-lg">
            Generate and visualize X-Ray images with GAN
          </p>
        </div>
        
        <div className="bg-zinc-800/30 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-zinc-600/30">
          <div className="mb-8 flex justify-between items-center">
            <button
              onClick={fetchImage}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg text-lg"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </div>
              ) : (
                'Generate'
              )}
            </button>
            <div className="flex gap-2">
              <a
                href="/model/xray_generator.keras"
                download
                className="px-3 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transform hover:scale-105 transition-all duration-200 text-sm flex items-center border border-green-500/30"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Generator
              </a>
              <a
                href="/model/xray_discriminator.keras"
                download
                className="px-3 py-2 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transform hover:scale-105 transition-all duration-200 text-sm flex items-center border border-orange-500/30"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Discriminator
              </a>
            </div>
            {error && (
              <div className="flex items-center text-red-300 bg-red-900/30 px-4 py-2 rounded-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {error}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
            {isLoading ? (
              Array(3).fill(null).map((_, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-zinc-600/30">
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
                  </div>
                </div>
              ))
            ) : currentImages.length > 0 ? (
              currentImages.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-zinc-600/30 group">
                  <img
                    src={imageUrl}
                    alt={`Generated X-Ray ${index + 1}`}
                    className="object-contain w-full h-full"
                    onError={() => setError('Failed to load generated image')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                    <span className="text-white/90 text-sm">
                      Image {index + 1}
                    </span>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = imageUrl;
                        link.download = `xray_image_${index + 1}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="text-white/90 hover:text-white p-1.5 rounded-lg hover:bg-black/20 transition-colors duration-200"
                      title="Download Image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              Array(3).fill(null).map((_, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-zinc-600/30">
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p className="text-zinc-300 mt-4">No image available</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 