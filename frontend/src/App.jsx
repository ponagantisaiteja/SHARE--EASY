import React, { useState, useRef } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Handle Drag and Drop states
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select or drop a file first.");
      return;
    }

    setUploading(true);
    setError("");
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Points cleanly to your backend server port 5000
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUploadResult(data.file);
        setFile(null); // Clear input on success
      } else {
        setError(data.error || "Something went wrong during upload.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Unable to connect to the backend server. Make sure it is running.");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            ShareEasy
          </h1>
          <p className="text-sm text-slate-400">Instantly share files via links and QR codes</p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              dragActive 
                ? "border-indigo-400 bg-indigo-950/30" 
                : "border-slate-700 hover:border-slate-500 bg-slate-950/40"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="space-y-2">
              <div className="text-3xl">📁</div>
              {file ? (
                <div className="text-sm font-medium text-indigo-400 truncate max-w-xs mx-auto">
                  {file.name}
                </div>
              ) : (
                <div className="text-sm text-slate-400">
                  <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                </div>
              )}
              <span className="text-xs text-slate-500 block">Supports files up to 50MB</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg text-xs text-red-400 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !file}
            className={`w-full py-3 px-4 rounded-xl font-medium tracking-wide transition-all ${
              uploading || !file
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.99]"
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </span>
            ) : (
              "Generate Share Link"
            )}
          </button>
        </form>

        {/* Result Area */}
        {uploadResult && (
          <div className="pt-4 border-t border-slate-800 space-y-4 animate-fadeIn">
            <h3 className="text-sm font-semibold text-slate-300">🎉 File Uploaded Successfully!</h3>
            
            {/* Action Card */}
            <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-xl space-y-4 text-center">
              <div className="flex bg-slate-900 rounded-lg overflow-hidden border border-slate-800 p-1 items-center justify-between">
                <span className="text-xs text-slate-400 px-2 truncate max-w-[240px]">
                  {uploadResult.fileUrl}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(uploadResult.fileUrl)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    copied ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-3 inline-block rounded-xl mx-auto shadow-inner">
                <img 
                  src={uploadResult.qrCodeUrl} 
                  alt="File Share QR Code" 
                  className="w-40 h-40"
                />
              </div>
              <p className="text-xs text-slate-500">Scan this code with a mobile camera to instantly download.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;