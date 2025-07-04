import React from 'react';
import { Document as PDFDocument, Page as PDFPage, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function PDFViewer({
  file,
  pageNumber,
  onLoadSuccess,
  onLoadError,
  zoomLevel,
}: {
  file: string;
  pageNumber: number;
  onLoadSuccess: (info: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
  zoomLevel: number;
}) {
  console.log('PDFViewer rendering with file:', file, 'pageNumber:', pageNumber);

  const handleLoadSuccess = (info: { numPages: number }) => {
    console.log('PDF loaded successfully:', info);
    onLoadSuccess(info);
  };

  const handleLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    onLoadError(error);
  };

  return (
    <div style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}>
      <PDFDocument
        file={file}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        loading={<div className="text-center p-4">Loading PDF... (file: {file})</div>}
        error={<div className="text-center p-4 text-red-600">Failed to load PDF from {file}</div>}
      >
        <PDFPage
          pageNumber={pageNumber}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          loading={<div className="text-center p-2">Loading page {pageNumber}...</div>}
          error={<div className="text-center p-2 text-red-600">Failed to load page {pageNumber}</div>}
        />
      </PDFDocument>
    </div>
  );
} 