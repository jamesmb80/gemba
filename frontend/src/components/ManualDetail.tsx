import React, { useState, useEffect, useRef } from 'react';
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
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface ManualDetailProps {
  document: Document;
  onBack: () => void;
}

export const ManualDetail = ({ document, onBack }: ManualDetailProps) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!document) return;
    setLoading(true);
    setError(null);
    setPdfDoc(null);
    setNumPages(0);
    setCurrentPage(1);
    const fetchAndLoadPdf = async () => {
      console.log('fetchAndLoadPdf: Starting...');
      setLoading(true);
      setError(null);
      try {
        console.log('fetchAndLoadPdf: Fetching PDF from:', `/api/pdf/${document.storage_path}`);
        const response = await fetch(`/api/pdf/${document.storage_path}`);
        console.log('fetchAndLoadPdf: Response status:', response.status);
        if (!response.ok) {
          console.error('fetchAndLoadPdf: Response not ok:', response.status, response.statusText);
          throw new Error(`Failed to fetch PDF: ${response.status}`);
        }
        const pdfBlob = await response.blob();
        console.log('fetchAndLoadPdf: PDF blob size:', pdfBlob.size);
        const pdfArrayBuffer = await pdfBlob.arrayBuffer();
        console.log('fetchAndLoadPdf: ArrayBuffer size:', pdfArrayBuffer.byteLength);
        console.log('fetchAndLoadPdf: Loading with PDF.js...');
        const pdfDoc = await pdfjsLib.getDocument(pdfArrayBuffer).promise;
        console.log('fetchAndLoadPdf: PDF.js document loaded, pages:', pdfDoc.numPages);
        setPdfDoc(pdfDoc);
        console.log('fetchAndLoadPdf: pdfDoc state set');
        setNumPages(pdfDoc.numPages);
        setLoading(false);
      } catch (err: any) {
        console.error('fetchAndLoadPdf: Error:', err);
        setError('Failed to load PDF: ' + (err?.message || err));
        setLoading(false);
      }
    };
    fetchAndLoadPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document]);

  useEffect(() => {
    if (!pdfDoc) {
      console.warn('renderPage: pdfDoc not ready');
      return;
    }
    if (!canvasEl) {
      console.warn('renderPage: canvasEl not ready');
      return;
    }
    let cancelled = false;
    const renderPage = async () => {
      setLoading(true);
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: zoomLevel });
        const context = canvasEl.getContext('2d');
        if (!context) {
          console.error('Canvas context is null');
          setError('Failed to get canvas context.');
          setLoading(false);
          return;
        }
        canvasEl.width = viewport.width;
        canvasEl.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        if (!cancelled) setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          console.error('PDF.js render error:', err);
          setError('Failed to render: ' + (err?.message || err));
          setLoading(false);
        }
      }
    };
    renderPage();
    return () => { cancelled = true; };
  }, [pdfDoc, canvasEl, currentPage, zoomLevel]);

  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage((p) => (numPages ? Math.min(numPages, p + 1) : p + 1));
  const zoomIn = () => setZoomLevel((z) => Math.min(z + 0.2, 3));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 0.2, 0.5));

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
        <div className="bg-gray-300 rounded p-4 overflow-auto flex flex-col items-center justify-center" style={{ minHeight: '600px' }}>
          <div className="relative">
            <canvas ref={setCanvasEl} style={{ border: '1px solid #ccc', width: '100%', maxWidth: 800, background: '#fff' }} />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <div>Loading PDF...</div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <div className="text-red-600">{error}</div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button onClick={goToPrevPage} disabled={currentPage <= 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronLeftIcon size={18} /></button>
            <span>Page {currentPage} / {numPages || '?'}</span>
            <button onClick={goToNextPage} disabled={numPages ? currentPage >= numPages : true} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronRightIcon size={18} /></button>
            <button onClick={zoomOut} className="p-2 rounded hover:bg-gray-200"><ZoomOutIcon size={18} /></button>
            <button onClick={zoomIn} className="p-2 rounded hover:bg-gray-200"><ZoomInIcon size={18} /></button>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Uploaded: {new Date(document.uploaded_at).toLocaleString()}<br />
          Uploader: {document.uploader_id}
        </div>
      </div>
    </div>
  );
};
