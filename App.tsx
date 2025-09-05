import React, { useState } from 'react';
import type { Color } from './types';
import { HAIR_COLORS, HAIR_STYLES } from './constants';
import { changeHairColor } from './services/geminiService';

const UploadIcon: React.FC = () => (
  <svg className="w-12 h-12 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
  </svg>
);

const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
        <p className="mt-4 text-lg text-gray-300">Magically restyling...</p>
        <p className="text-sm text-gray-500">This can take a moment.</p>
    </div>
);

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setGeneratedImage(null);
      setError(null);
    } else {
      setError("Please select a valid image file.");
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleGenerateClick = async () => {
    if (!imageFile || !selectedColor || !selectedStyle) {
      setError("Please upload an image, select a color, and choose a style first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await changeHairColor(imageFile, selectedColor.name, selectedStyle);
      setGeneratedImage(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isGenerateDisabled = !imageFile || !selectedColor || !selectedStyle || isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            AI Hair Color & Style Changer
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-400">
            Upload a portrait, pick a vibrant new color and style, and let AI do the magic.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-4 bg-gray-800/50 rounded-2xl p-6 shadow-lg border border-gray-700 flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-purple-300">1. Select a Color</h2>
              <p className="text-gray-400 mb-6">Choose your desired hair color.</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-3">
                {HAIR_COLORS.map((color) => (
                  <div key={color.hex} className="flex flex-col items-center">
                    <button
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-4 transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-400 ${
                        selectedColor?.hex === color.hex ? 'border-purple-400 scale-110' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Select color ${color.name}`}
                    />
                    <span className="mt-2 text-xs text-center text-gray-400 truncate w-16">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2 text-purple-300">2. Choose a Style</h2>
              <p className="text-gray-400 mb-6">Pick a new hairstyle for the character.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                {HAIR_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-3 py-2 text-sm font-medium text-center rounded-lg border-2 transition-colors duration-200 ${
                      selectedStyle === style ? 'border-purple-400 bg-purple-500/30 text-white' : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2 text-purple-300">3. Generate</h2>
              <p className="text-gray-400 mb-6">Ready for the new look? Press the button!</p>
              <button
                onClick={handleGenerateClick}
                disabled={isGenerateDisabled}
                className="w-full text-lg font-semibold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700"
              >
                {isLoading ? 'Generating...' : 'Change Hair'}
              </button>
              {error && <p className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
            </div>
          </div>

          {/* Image Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before Image */}
            <div className="flex flex-col bg-gray-800/50 rounded-2xl p-6 shadow-lg border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-300">Original Image</h2>
              <div className="aspect-square w-full bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                <label htmlFor="file-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Uploaded preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center p-4">
                      <UploadIcon />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
                    </div>
                  )}
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                </label>
              </div>
            </div>

            {/* After Image */}
            <div className="flex flex-col bg-gray-800/50 rounded-2xl p-6 shadow-lg border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-300">Generated Image</h2>
              <div className="aspect-square w-full bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                {isLoading && <Loader />}
                {!isLoading && generatedImage && <img src={generatedImage} alt="Generated result" className="w-full h-full object-cover rounded-lg" />}
                {!isLoading && !generatedImage && !error && (
                  <div className="text-center text-gray-500 p-4">
                    <p>Your AI-generated image will appear here.</p>
                  </div>
                )}
                {!isLoading && !generatedImage && error && (
                   <div className="text-center text-red-400 p-4">
                    <p>Generation Failed</p>
                    <p className="text-sm text-gray-500 mt-1">Please try again or use a different image.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default App;