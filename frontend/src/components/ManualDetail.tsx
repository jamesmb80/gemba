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
import dynamic from 'next/dynamic';

interface ManualDetailProps {
  document: Document;
  onBack: () => void;
}

const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false });

export const ManualDetail = ({ document, onBack }: ManualDetailProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfLoading, setPdfLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  console.log('ManualDetail rendered with document:', document);
  console.log('PDF URL will be:', `/api/pdf/${document?.storage_path || document?.id}`);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('Document load success callback called with numPages:', numPages);
    setNumPages(numPages);
    setPdfLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    setError('Failed to load PDF document');
    setPdfLoading(false);
    console.error('PDF loading error:', error);
  };

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
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeftIcon size={20} />
            </button>
            <span className="text-sm">
              Page <span className="font-medium">{currentPage}</span> of {numPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
              disabled={currentPage >= numPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
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
        <div className="bg-gray-300 rounded p-4 overflow-auto" style={{ minHeight: '600px' }}>
          {error ? (
            <div className="text-center p-8 text-red-600">{error}</div>
          ) : (
            <PDFViewer
              file={`/api/pdf/${document.storage_path || document.id}`}
              pageNumber={currentPage}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              zoomLevel={zoomLevel}
            />
          )}
        </div>
      </div>
    </div>
  );
};
