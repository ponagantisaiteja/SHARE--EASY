import React, { useState } from "react";
import FileUpload from "../components/FileUpload";

function Home() {
  const [uploadResult, setUploadResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleUploadSuccess = (uploadedFileData) => {
    setUploadResult(uploadedFileData);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
        
        {/* Main Branding Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            ShareEasy
          </h1>
          <p className="text-sm text-slate-400">Instantly share files via links and QR codes</p>
        </div>

        {/* Embedded Upload Component */}
        <FileUpload onUploadSuccess={handleUploadSuccess} />

        {/* Dynamic Download Action Card */}
        {uploadResult && (
          <div className="pt-4 border-t border-slate-800 space-y-4 animate-fadeIn">
            <h3 className="text-sm font-semibold text-slate-300">🎉 File Uploaded Successfully!</h3>
            
            <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-xl space-y-4 text-center">
              {/* Copy URL Link Section */}
              <div className="flex bg-slate-900 rounded-lg overflow-hidden border border-slate-800 p-1 items-center justify-between">
                <span className="text-xs text-slate-400 px-2 truncate max-w-[240px]">
                  {uploadResult.fileUrl}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(uploadResult.fileUrl)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                    copied ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              {/* QR Code Graphic Frame */}
              <div className="bg-white p-3 inline-block rounded-xl mx-auto shadow-inner">
                <img 
                  src={uploadResult.qrCodeUrl} 
                  alt="File Share QR Code" 
                  className="w-40 h-40 object-contain"
                />
              </div>
              
              <p className="text-xs text-slate-500">
                Scan this code with a mobile camera to download instantly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;