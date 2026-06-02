import React, { useState, useRef } from "react";

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select or drop a file first.");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Connects directly to your local backend API port
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onUploadSuccess(data.file); // Pass the uploaded file object back to Home.jsx
        setFile(null); // Reset the local file input field
      } else {
        setError(data.error || "Something went wrong during upload.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Unable to reach backend server. Ensure 'npm start' is running on port 5000.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
              <span className="font-semibold text-indigo-400">Click to upload</span> or drag & drop
            </div>
          )}
          <span className="text-xs text-slate-500 block">Supports any file format up to 50MB</span>
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
            Uploading File...
          </span>
        ) : (
          "Generate Secure Share Link"
        )}
      </button>
    </form>
  );
}

export default FileUpload; 