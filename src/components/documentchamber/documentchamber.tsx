"use client";

import React, { useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
// If TS complains about types, add a file `src/react-signature-canvas.d.ts` with:
// declare module "react-signature-canvas";

type DocStatus = "Draft" | "In Review" | "Signed";

interface DocumentItem {
  id: string;
  name: string;
  fileUrl?: string;
  mime?: string;
  status: DocStatus;
  uploadedAt: string; // ISO
  signatureData?: string; // dataURL
}

const STATUS_COLORS: Record<DocStatus, string> = {
  Draft: "bg-gray-100 text-gray-800 ring-gray-300",
  "In Review": "bg-amber-100 text-amber-800 ring-amber-300",
  Signed: "bg-emerald-100 text-emerald-800 ring-emerald-300",
};

const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
  </div>
);

const StatusChip: React.FC<{ status: DocStatus }> = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${STATUS_COLORS[status]}`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${status === "Signed"
          ? "bg-emerald-500"
          : status === "In Review"
            ? "bg-amber-500"
            : "bg-gray-400"
        }`}
    />
    {status}
  </span>
);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

/** MAIN PAGE */
const DocumentChamberPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DocStatus | "All">("All");
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(null); // right preview panel
  const [isSignOpen, setIsSignOpen] = useState(false);
  const [signDocId, setSignDocId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Upload (drag+drop)
  const [dragOver, setDragOver] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const sigRef = useRef<SignatureCanvas>(null);

  const visibleDocs = useMemo(() => {
    let list = documents.slice();
    if (filter !== "All") list = list.filter((d) => d.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }
    return list.sort(
      (a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt)
    );
  }, [documents, search, filter]);

  const onPickFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setPendingFiles(Array.from(files));
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    setPendingFiles(files);
  };

  const uploadPending = () => {
    if (!pendingFiles.length) return;
    const newDocs: DocumentItem[] = pendingFiles.map((f) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      fileUrl: URL.createObjectURL(f),
      mime: f.type || undefined,
      status: "Draft",
      uploadedAt: new Date().toISOString(),
    }));
    setDocuments((prev) => [...newDocs, ...prev]);
    setPendingFiles([]);
  };

  const changeStatus = (id: string, status: DocStatus) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  };

  const openSign = (id: string) => {
    setSignDocId(id);
    setIsSignOpen(true);
    // clear any previous strokes when opening
    setTimeout(() => sigRef.current?.clear(), 0);
  };
  const closeSign = () => {
    setIsSignOpen(false);
    setSignDocId(null);
  };

  const saveSignature = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert("Please add your signature first.");
      return;
    }
    const dataUrl = sigRef.current.toDataURL();
    if (!signDocId) return;
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === signDocId ? { ...d, signatureData: dataUrl, status: "Signed" } : d
      )
    );
    closeSign();
  };

  const confirmDelete = (id: string) => setDeleteId(id);
  const doDelete = () => {
    if (!deleteId) return;
    setDocuments((prev) => prev.filter((d) => d.id !== deleteId));
    if (activeDoc?.id === deleteId) setActiveDoc(null);
    setDeleteId(null);
  };

  const isPDF = (doc?: DocumentItem | null) =>
    doc?.mime?.includes("pdf") || doc?.name?.toLowerCase().endsWith(".pdf");

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Page Header / Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 blur-3xl bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-400 via-fuchsia-400 to-amber-300" />
        <div className="relative px-6 pt-8 pb-10 sm:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                📂 Document Chamber
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Upload, preview, and sign deals/contracts. Keep everything tidy with clear statuses and a smooth signing experience.
              </p>
              {/* Quick Stats */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-xl font-semibold">{documents.length}</p>
                </div>
                <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-500">In Review</p>
                  <p className="text-xl font-semibold">
                    {documents.filter((d) => d.status === "In Review").length}
                  </p>
                </div>
                <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-500">Signed</p>
                  <p className="text-xl font-semibold text-emerald-600">
                    {documents.filter((d) => d.status === "Signed").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-14 sm:px-10">
        {/* Top Controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {(["All", "Draft", "In Review", "Signed"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition ${filter === t
                    ? "bg-indigo-600 text-white ring-indigo-600"
                    : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents…"
              className="w-full sm:w-72 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Upload */}
          <section className="lg:col-span-1">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <SectionTitle
                title="Upload Documents"
                subtitle="Drag & drop or choose files. PDFs show inline preview."
              />
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${dragOver
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 15a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4m-7-8-4 4 4 4m-4-4h12" />
                </svg>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-indigo-600">Choose files</span> or drag them here
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => onPickFiles(e.target.files)}
                />
              </label>

              {pendingFiles.length > 0 && (
                <div className="mt-4 rounded-xl border bg-gray-50 p-3">
                  <p className="mb-2 text-sm font-medium text-gray-700">Ready to upload</p>
                  <ul className="space-y-1 text-sm">
                    {pendingFiles.map((f) => (
                      <li key={f.name} className="flex items-center justify-between">
                        <span className="truncate">{f.name}</span>
                        <span className="text-gray-400 text-xs">
                          {(f.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={uploadPending}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Upload
                    </button>
                    <button
                      onClick={() => setPendingFiles([])}
                      className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Middle: List */}
          <section className="lg:col-span-1">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <SectionTitle
                title="Your Documents"
                subtitle="Click a document to preview & manage."
              />
              {visibleDocs.length === 0 ? (
                <p className="text-sm text-gray-500">No documents yet.</p>
              ) : (
                <ul className="space-y-3">
                  {visibleDocs.map((doc) => (
                    <li
                      key={doc.id}
                      className={`group rounded-xl border p-4 transition hover:shadow-md cursor-pointer ${activeDoc?.id === doc.id ? "border-indigo-300 bg-indigo-50/40" : "border-gray-200 bg-white"
                        }`}
                      onClick={() => setActiveDoc(doc)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{doc.name}</p>
                          <p className="mt-0.5 text-xs text-gray-500">Uploaded {formatDate(doc.uploadedAt)}</p>
                        </div>
                        <StatusChip status={doc.status} />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSign(doc.id);
                          }}
                        >
                          Sign / Edit Signature
                        </button>
                        <button
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(doc.id);
                          }}
                        >
                          Delete
                        </button>
                        <select
                          value={doc.status}
                          onChange={(e) =>
                            changeStatus(doc.id, e.target.value as DocStatus)
                          }
                          className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="Draft">Draft</option>
                          <option value="In Review">In Review</option>
                          <option value="Signed">Signed</option>
                        </select>
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto text-xs font-medium text-indigo-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Open in new tab
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Right: Preview */}
          <section className="lg:col-span-1">
            <div className="rounded-2xl border bg-white p-5 shadow-sm h-full">
              <SectionTitle title="Preview Panel" subtitle="PDFs render inline, other docs show meta & download." />
              {!activeDoc ? (
                <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
                  <p className="text-sm text-gray-500">Select a document to preview</p>
                </div>
              ) : isPDF(activeDoc) ? (
                <div className="overflow-hidden rounded-xl border">
                  <iframe
                    title={activeDoc.name}
                    src={activeDoc.fileUrl}
                    className="h-[420px] w-full"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <p className="font-medium text-gray-900">{activeDoc.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Type: {activeDoc.mime || "Unknown"}</p>
                    <p className="text-sm text-gray-500">Uploaded: {formatDate(activeDoc.uploadedAt)}</p>
                  </div>
                  <a
                    href={activeDoc.fileUrl}
                    download={activeDoc.name}
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Download
                  </a>
                </div>
              )}

              {/* Show stored signature (if any) */}
              {activeDoc?.signatureData && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Saved Signature</p>
                  <img
                    src={activeDoc.signatureData}
                    alt="signature"
                    className="h-24 w-auto rounded-md border bg-white p-2 shadow-sm"
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* SIGN MODAL */}
      {isSignOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeSign}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">E-Signature</h3>
                <p className="text-xs text-gray-500">Use your mouse or touch to sign below.</p>
              </div>
              <button
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                onClick={closeSign}
              >
                ✕
              </button>
            </div>

            {/* ✅ FIXED WRAPPER */}
            <div className="rounded-xl border bg-gray-50 p-3 overflow-hidden">
              <SignatureCanvas
                ref={sigRef}
                penColor="black"
                canvasProps={{
                  className: "w-full h-48 bg-white rounded-md shadow-inner",
                }}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                  onClick={() => sigRef.current?.clear()}
                >
                  Clear
                </button>
                <button
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  onClick={saveSignature}
                >
                  Save Signature
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Your signature will be embedded with the document record.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* DELETE CONFIRM */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">Delete document?</h3>
            <p className="mt-1 text-sm text-gray-600">
              This action cannot be undone.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                onClick={doDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentChamberPage;
