import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { analyzeDocument } from '../services/geminiService';
import { AnalysisResult } from '../types';
import AnalysisResults from './AnalysisResults';

const Dashboard: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState('');
  const [inputType, setInputType] = useState<'file' | 'text'>('file');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  // Utility to compress image before sending to AI
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1536; // Limit to 1536px for speed
          const MAX_HEIGHT = 1536;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          // Remove prefix to get raw base64
          resolve(dataUrl.split(',')[1]);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (inputType === 'file' && !file) {
      setError("Please select a file.");
      return;
    }
    if (inputType === 'text' && !inputText.trim()) {
      setError("Please enter some text.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      if (inputType === 'text') {
        const data = await analyzeDocument(inputText, 'text/plain', true);
        setResult(data);
      } else if (file) {
        let base64Data = "";
        
        if (file.type.startsWith('image/')) {
           // Compress if it's an image
           try {
             base64Data = await compressImage(file);
           } catch (e) {
             console.error("Compression failed, falling back to raw", e);
             // Fallback to raw file reading
             const reader = new FileReader();
             await new Promise((resolve) => {
                reader.onloadend = () => {
                   base64Data = (reader.result as string).split(',')[1];
                   resolve(true);
                }
                reader.readAsDataURL(file);
             });
           }
        } else {
           // PDF or other non-image
           const reader = new FileReader();
           await new Promise((resolve) => {
              reader.onloadend = () => {
                 base64Data = (reader.result as string).split(',')[1];
                 resolve(true);
              }
              reader.readAsDataURL(file);
           });
        }
        
        const mimeType = file.type.startsWith('image/') ? 'image/jpeg' : file.type;
        const data = await analyzeDocument(base64Data, mimeType, false);
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-teal-700 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight">ArogyaVani</span>
            <span className="text-xs bg-teal-800 px-2 py-0.5 rounded text-teal-200">BETA</span>
          </div>
          <div className="text-sm font-light opacity-90">AI Powered Healthcare</div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {!result ? (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Medical Document</h1>
              <p className="text-gray-500 mb-8">
                Upload a prescription, consent form, or lab report (Image/PDF) or paste the text directly.
              </p>

              {/* Tabs */}
              <div className="flex space-x-4 mb-6 border-b">
                <button
                  onClick={() => setInputType('file')}
                  className={`pb-2 px-4 text-sm font-medium transition ${
                    inputType === 'file' 
                      ? 'border-b-2 border-teal-600 text-teal-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setInputType('text')}
                  className={`pb-2 px-4 text-sm font-medium transition ${
                    inputType === 'text' 
                      ? 'border-b-2 border-teal-600 text-teal-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Paste Text
                </button>
              </div>

              {/* Input Area */}
              <div className="min-h-[200px] flex flex-col justify-center">
                {inputType === 'file' ? (
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition bg-gray-50 ${file ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-400'}`}
                  >
                    {!file ? (
                      <>
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 text-teal-600">
                          <Upload className="w-8 h-8" />
                        </div>
                        <p className="text-gray-700 font-medium mb-2">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400">JPG, PNG, PDF supported</p>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*,application/pdf"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        />
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 mx-auto text-teal-600">
                          {file.type.includes('image') ? <ImageIcon /> : <FileText />}
                        </div>
                        <p className="font-semibold text-gray-800">{file.name}</p>
                        <p className="text-xs text-gray-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-red-500 text-sm hover:underline flex items-center justify-center"
                        >
                          <X className="w-4 h-4 mr-1" /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste the content of the medical report or consent form here..."
                    className="w-full h-48 p-4 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none text-gray-700 bg-gray-50"
                  />
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (inputType === 'file' && !file) || (inputType === 'text' && !inputText)}
                className={`mt-6 w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center transition
                  ${isAnalyzing || (inputType === 'file' && !file) || (inputType === 'text' && !inputText)
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-teal-600 hover:bg-teal-700 transform hover:-translate-y-0.5'
                  }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Processing with ArogyaVani AI...
                  </>
                ) : (
                  "Analyze Document"
                )}
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                Powered by Gemini. Securely processed.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <button 
              onClick={() => setResult(null)}
              className="text-teal-600 hover:underline flex items-center font-medium"
            >
              ← Upload another document
            </button>
            <AnalysisResults data={result} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
