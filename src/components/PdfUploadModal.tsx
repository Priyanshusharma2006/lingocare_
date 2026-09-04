import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  AlertTriangle,
  Loader2,
  Sparkles,
  FileUp,
} from 'lucide-react';
import { parsePdfCurriculum } from '../services/aiService';
import type { ParseProgress } from '../services/aiService';
import { useCurriculum } from '../context/useCurriculum';

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApiKeyModal: () => void;
}

export const PdfUploadModal: React.FC<PdfUploadModalProps> = ({
  isOpen,
  onClose,
  onOpenApiKeyModal,
}) => {
  const { setCurriculumTree } = useCurriculum();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ParseProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setSelectedFile(null);
    setIsLoading(false);
    setProgress(null);
    setErrorMsg(null);
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing mid-upload
    resetState();
    onClose();
  };

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Invalid file format. Please upload a PDF file (.pdf).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('File size exceeds 20MB limit. Please upload a smaller PDF.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const startExtraction = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const extractedCurriculum = await parsePdfCurriculum(selectedFile, (p) => {
        setProgress(p);
      });

      setCurriculumTree(
        extractedCurriculum,
        `Successfully extracted "${extractedCurriculum.title}" with ${extractedCurriculum.modules.length} modules!`
      );

      handleClose();
    } catch (err: any) {
      setIsLoading(false);
      const message =
        err.message || 'Failed to extract curriculum. Please verify your PDF or API key.';
      setErrorMsg(message);
    }
  };

  return (
    <div
      id="pdf-upload-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF8EE] text-[#EC8601] flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Upload Curriculum Document
              </h3>
              <p className="text-xs text-slate-500">
                Extract 4-level structured curriculum from any PDF syllabus
              </p>
            </div>
          </div>
          {!isLoading && (
            <button
              type="button"
              id="close-upload-modal"
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {!isLoading ? (
            <>
              {/* Dropzone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-[#EC8601] bg-[#FFF8EE]'
                    : selectedFile
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-200 hover:border-[#EC8601]/60 hover:bg-slate-50/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  id="pdf-file-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2 animate-fade-in">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-800 break-all">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Click to change file
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-[#FFF8EE] group-hover:text-[#EC8601] transition-colors">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700">
                        Click to browse or drag & drop PDF
                      </p>
                      <p className="text-xs text-slate-400">
                        Supports native PDF syllabi, lecture outlines & course schedules
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 animate-fade-in text-xs text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Extraction Failed</p>
                    <p className="text-rose-700 mt-0.5">{errorMsg}</p>
                    {errorMsg.includes('API key') && (
                      <button
                        type="button"
                        onClick={onOpenApiKeyModal}
                        className="mt-2 inline-flex items-center gap-1 font-semibold text-[#EC8601] underline hover:text-[#D97706]"
                      >
                        Enter API Key Now →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Specs pill note */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-3">
                <span>⚡ Powered by Google Gemini 2.5 Flash</span>
                <span>Max size: 20MB</span>
              </div>
            </>
          ) : (
            /* Animated Loading State with Progress Steps */
            <div className="py-6 flex flex-col items-center justify-center gap-5 text-center animate-fade-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[#FFF8EE] text-[#EC8601] flex items-center justify-center animate-pulse-glow shadow-md">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <div className="w-full space-y-2">
                <h4 className="text-base font-bold text-slate-900">
                  {progress?.message || 'Processing curriculum PDF...'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Extracting nested Modules, Topics, and Lessons according to Lingocare educational schema.
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
                  <div
                    className="bg-[#EC8601] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress?.percentage || 25}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>{progress?.step || 'uploading'}</span>
                  <span>{progress?.percentage || 25}%</span>
                </div>
              </div>

              {/* Skeleton preview indicators */}
              <div className="w-full space-y-2 pt-2 border-t border-slate-100 opacity-60">
                <div className="h-4 bg-slate-200 rounded-md w-3/4 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded-md w-full animate-pulse" />
                <div className="h-3 bg-slate-200 rounded-md w-5/6 animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              id="confirm-upload-btn"
              disabled={!selectedFile}
              onClick={startExtraction}
              className={`px-5 py-2 text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-2 ${
                selectedFile
                  ? 'bg-[#EC8601] hover:bg-[#D97706] text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <FileUp className="w-4 h-4" />
              <span>Parse & Populate Tree</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
