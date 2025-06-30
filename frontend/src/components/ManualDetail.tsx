import React, { useState } from 'react';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ZoomInIcon,
  ZoomOutIcon,
  DownloadIcon,
  PrinterIcon,
} from 'lucide-react';
import { Document } from '../types/document';

interface ManualDetailProps {
  document: Document;
  onBack: () => void;
}

export const ManualDetail = ({ document, onBack }: ManualDetailProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Temporary placeholder - PDF.js disabled for now
  const mockPdfContent = (
    <div className="bg-white border shadow-sm rounded-sm p-8 text-sm">
      <h1 className="text-xl font-bold mb-4">{document.filename}</h1>
      <p className="text-gray-500 mb-4">
        Page {currentPage} of {document.filename}
      </p>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Document Content</h2>
        <p className="mb-2">
          This is a placeholder for PDF content. The actual PDF viewer will be implemented once the app is running properly.
        </p>
        <p>
          Document: {document.filename}<br/>
          Uploaded: {new Date(document.uploaded_at).toLocaleString()}<br/>
          Uploader: {document.uploader_id}
        </p>
      </div>
    </div>
  );

  if (!document) {
    return <div className="text-red-600">No document selected or document not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 mr-2"
          aria-label="Go back"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <h1 className="text-xl font-bold">{document.filename}</h1>
      </div>
      <div className="bg-gray-100 rounded-lg shadow-md p-4 mb-4">
        {/* PDF viewer toolbar */}
        <div className="flex justify-between items-center mb-4 bg-white p-2 rounded-md shadow-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeftIcon size={20} />
            </button>
            <span className="text-sm">
              Page <span className="font-medium">{currentPage}</span> of 1
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Next page"
            >
              <ChevronRightIcon size={20} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Zoom out"
            >
              <ZoomOutIcon size={18} />
            </button>
            <span className="text-sm">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Zoom in"
            >
              <ZoomInIcon size={18} />
            </button>
            <span className="w-px h-6 bg-gray-300 mx-1"></span>
            <button
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Download PDF"
            >
              <DownloadIcon size={18} />
            </button>
            <button
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Print PDF"
            >
              <PrinterIcon size={18} />
            </button>
          </div>
        </div>
        {/* PDF viewer content */}
        <div
          className="bg-gray-300 rounded p-4 overflow-auto"
          style={{
            minHeight: '600px',
          }}
        >
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
          >
            {mockPdfContent}
          </div>
        </div>
      </div>
    </div>
  );
};
