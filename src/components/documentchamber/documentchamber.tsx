"use client";

import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

interface DocumentItem {
  id: string;
  name: string;
  fileUrl?: string;
  status: "Draft" | "In Review" | "Signed";
  signatureData?: string;
}

export default function DocumentChamber() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    const newDoc: DocumentItem = {
      id: String(Date.now()),
      name: selectedFile.name,
      fileUrl: URL.createObjectURL(selectedFile),
      status: "Draft",
    };
    setDocuments([newDoc, ...documents]);
    setSelectedFile(null);
  };

  const handleStatusChange = (id: string, status: DocumentItem["status"]) => {
    setDocuments(
      documents.map((doc) => (doc.id === id ? { ...doc, status } : doc))
    );
  };

  const handleSignatureSave = (id: string) => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      alert("Please provide a signature first!");
      return;
    }
    const dataUrl = sigCanvas.current.toDataURL();
    setDocuments(
      documents.map((doc) =>
        doc.id === id ? { ...doc, signatureData: dataUrl, status: "Signed" } : doc
      )
    );
    alert("Signature saved successfully!");
    sigCanvas.current.clear();
  };

  const handleClearSignature = () => {
    sigCanvas.current?.clear();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-indigo-600 mb-4">📂 Document Chamber</h1>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-2xl shadow-md space-y-3">
        <h2 className="text-xl font-semibold">Upload New Document</h2>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="border p-2 rounded-md w-full"
        />
        <button
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          onClick={handleUpload}
          disabled={!selectedFile}
        >
          Upload
        </button>
      </div>

      {/* Documents List */}
      <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <h2 className="text-xl font-semibold">📑 Documents</h2>
        {documents.length === 0 && <p className="text-gray-500">No documents uploaded yet</p>}
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border-l-4 border-gray-300 rounded-lg bg-gray-50"
          >
            <div className="flex-1">
              <p className="font-medium">{doc.name}</p>
              <p className="text-sm text-gray-500">Status: <span className="font-semibold">{doc.status}</span></p>
              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  className="text-indigo-600 hover:underline text-sm"
                  rel="noreferrer"
                >
                  Preview Document
                </a>
              )}
            </div>

            {/* Signature and Status Controls */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <button
                  className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                  onClick={() => setSelectedDocId(doc.id)}
                >
                  Sign / Edit Signature
                </button>
                <button
                  className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                  onClick={() => setDocuments(documents.filter(d => d.id !== doc.id))}
                >
                  Delete
                </button>
                <select
                  value={doc.status}
                  onChange={(e) =>
                    handleStatusChange(doc.id, e.target.value as DocumentItem["status"])
                  }
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  <option value="Draft">Draft</option>
                  <option value="In Review">In Review</option>
                  <option value="Signed">Signed</option>
                </select>
              </div>

              {/* Signature Pad */}
              {selectedDocId === doc.id && (
                <div className="mt-2 flex flex-col gap-2">
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{ width: 400, height: 150, className: "border rounded-lg" }}
                  />
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                      onClick={() => handleSignatureSave(doc.id)}
                    >
                      Save Signature
                    </button>
                    <button
                      className="px-4 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition text-sm"
                      onClick={handleClearSignature}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Display saved signature */}
              {doc.signatureData && (
                <img
                  src={doc.signatureData}
                  alt="signature"
                  className="w-64 h-24 border rounded-md mt-2 object-contain"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
