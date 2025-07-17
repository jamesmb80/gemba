import React from 'react';

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
  React.useEffect(() => {
    // Simulate successful load for iframe viewer
    // Note: We can't get actual page count from iframe, so we use 1
    onLoadSuccess({ numPages: 1 });
  }, [file, onLoadSuccess]);

  return (
    <div
      style={{
        transform: `scale(${zoomLevel / 100})`,
        transformOrigin: 'top center',
        width: '100%',
        height: '600px',
      }}
    >
      <iframe
        src={file}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '4px',
        }}
        title="PDF Viewer"
        onLoad={() => {
          console.log('PDF iframe loaded successfully');
        }}
        onError={(e) => {
          console.error('PDF iframe error:', e);
          onLoadError(new Error('Failed to load PDF in iframe'));
        }}
      >
        <div className="text-center p-4 text-red-600">
          Your browser does not support PDF viewing.
          <a href={file} target="_blank" rel="noopener noreferrer" className="underline ml-1">
            Click here to download the PDF
          </a>
        </div>
      </iframe>
    </div>
  );
}
