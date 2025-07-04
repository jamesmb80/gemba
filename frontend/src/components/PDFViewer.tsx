import React from 'react';
import { Document as PDFDocument, Page as PDFPage, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use CDN for exact version match
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
  const handleLoadSuccess = (info: { numPages: number }) => {
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
        loading={<div className="text-center p-4">Loading PDF...</div>}
        error={
          <div className="text-center p-4 text-red-600">Failed to load PDF. Please try again.</div>
        }
        options={{
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        }}
      >
        <PDFPage
          pageNumber={pageNumber}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          loading={<div className="text-center p-2">Loading page...</div>}
          error={<div className="text-center p-2 text-red-600">Failed to load page</div>}
        />
      </PDFDocument>
    </div>
  );
}
