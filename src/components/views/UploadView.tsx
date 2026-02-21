"use client";

import { useState, useRef } from "react";

interface UploadViewProps {
  onFileSelect: (file: File) => void;
}

export default function UploadView({ onFileSelect }: UploadViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(true); 
  };
  
  const handleDragLeave = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(false); 
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); 
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <main className="max-w-2xl w-full flex flex-col items-center text-center gap-8 relative z-10">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            RimWorld <span className="text-orange-500">Wrapped</span>
          </h1>
          <p className="text-lg text-zinc-400">
            Relive the highlights, the tragedies, and the questionable moral choices of your colony. 
            Drop your savegame below to generate your personal infographic.
          </p>
        </div>

        <div
          className={`w-full p-12 mt-4 border-2 border-dashed rounded-2xl transition-all duration-200 ease-in-out flex flex-col items-center justify-center gap-4 cursor-pointer
            ${isDragging ? "border-orange-500 bg-orange-500/10" : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900"}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            accept=".rws,.xml"
            onChange={handleFileChange}
          />
          
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-zinc-200">
            Click to upload or drag and drop
          </h3>
          <p className="text-sm text-zinc-500">
            Select your RimWorld savegame (.rws)
          </p>
          
          <div className="mt-6 px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
            <p className="text-xs text-zinc-400 flex items-center gap-2 text-left">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>100% Secure: All processing happens locally in your browser. No data is uploaded to any server.</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}