import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftIcon, SearchIcon, FolderIcon, UploadIcon } from 'lucide-react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { supabase } from '../lib/supabaseClient';
import { Document } from '../types/document';
import { processPDFDocument } from '../lib/api';
// import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Configure PDF.js worker
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.31/pdf.worker.min.js`;

interface ManualViewerProps {
  machine: { id: string; name: string };
  onSelectManual: (doc: Document) => void;
  onBack: () => void;
}

function highlightMatch(text: string, term: string) {
  if (!term) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function getSnippet(text: string, term: string, length = 80) {
  if (!text || !term) return '';
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return '';
  const start = Math.max(0, idx - length / 2);
  const end = Math.min(text.length, idx + length / 2);
  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  return snippet;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Processing timed out')), ms)),
  ]);
}

export const ManualViewer = ({ machine, onSelectManual, onBack }: ManualViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [processingQueue, setProcessingQueue] = useState<Document[]>([]);
  const [queueProgress, setQueueProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });

  if (!machine) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Fetch documents for this machine
  useEffect(() => {
    if (!machine) return;
    const fetchDocuments = async () => {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('machine_id', machine.id)
        .order('uploaded_at', { ascending: false });
      if (dateFilter) query = query.gte('uploaded_at', dateFilter);
      if (fileTypeFilter) query = query.ilike('filename', `%${fileTypeFilter}`);
      if (searchTerm) {
        // Use full-text search for extracted_text
        query = query.or(`filename.ilike.%${searchTerm}%,extracted_text.fts.${searchTerm}`);
      }
      const { data, error } = await query;
      if (error) setUploadError(error.message);
      else setDocuments(data || []);
      // Update suggestions for autocomplete
      if (data && searchTerm) {
        setSuggestions(
          data
            .map((doc: Document) => doc.filename)
            .filter((name: string) => name.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 5),
        );
      } else {
        setSuggestions([]);
      }
    };
    fetchDocuments();
  }, [machine, dateFilter, fileTypeFilter, searchTerm]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleUploadDocuments = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploading(true);
    setProcessing(false);
    setProcessingStatus(null);
    setProcessingQueue([]);
    setQueueProgress({ current: 0, total: 0 });
    try {
      const files = e.target.files;
      if (!files || files.length === 0) throw new Error('No file selected');
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      const validFiles = Array.from(files).filter(
        (f) => f.type === 'application/pdf' && f.size <= maxFileSize,
      );
      const tooLargeFiles = Array.from(files).filter((f) => f.size > maxFileSize);
      if (tooLargeFiles.length > 0) {
        setUploadError('Some files exceed the 50MB size limit and were skipped.');
      }
      if (validFiles.length === 0)
        throw new Error('No valid PDF files to upload (check file type and size).');
      const uploadedDocs: Document[] = [];
      for (const file of validFiles) {
        // Sanitize filename: replace spaces with underscores and remove problematic characters
        const safeName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
        const storagePath = `${machine.id}/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, file);
        if (uploadError) throw uploadError;
        // Insert metadata into documents table
        const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
        const { data: inserted, error: dbError } = await supabase
          .from('documents')
          .insert({
            machine_id: machine.id,
            uploader_id: user?.id || null,
            filename: file.name,
            storage_path: storagePath,
            processing_status: 'pending',
          })
          .select()
          .single();
        if (dbError) throw dbError;
        uploadedDocs.push(inserted);
      }
      setProcessingQueue(uploadedDocs);
      setQueueProgress({ current: 0, total: uploadedDocs.length });
      setProcessing(true);
      setProcessingStatus('Processing PDF(s)...');
      for (let i = 0; i < uploadedDocs.length; i++) {
        try {
          await withTimeout(
            processPDFDocument(uploadedDocs[i].id, uploadedDocs[i].storage_path),
            60000,
          );
        } catch (err: any) {
          // Continue processing next file
        }
        setQueueProgress({ current: i + 1, total: uploadedDocs.length });
      }
      setProcessingStatus('All PDFs processed.');
      // Refresh document list
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('machine_id', machine.id)
        .order('uploaded_at', { ascending: false });
      setDocuments(data || []);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProcessing(false);
      setProcessingQueue([]);
      setQueueProgress({ current: 0, total: 0 });
    }
  };

  const handleRetryProcessing = async (doc: Document) => {
    setProcessing(true);
    setProcessingStatus('Retrying PDF processing...');
    try {
      await withTimeout(processPDFDocument(doc.id, doc.storage_path), 60000);
      setProcessingStatus('PDF processed successfully.');
      // Refresh document list
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('machine_id', machine.id)
        .order('uploaded_at', { ascending: false });
      setDocuments(data || []);
    } catch (err: any) {
      setProcessingStatus('PDF processing failed: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.extracted_text && doc.extracted_text.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
            aria-label="Go back"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className="text-xl font-bold">Machine Documentation</h1>
        </div>
        <label className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md cursor-pointer">
          <UploadIcon size={18} className="mr-2" />
          {uploading ? 'Uploading...' : 'Upload Documents'}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleUploadDocuments}
            className="hidden"
            disabled={uploading}
            multiple
          />
        </label>
      </div>
      {uploadError && <div className="text-red-600 mt-2">{uploadError}</div>}
      {processingStatus && <div className="text-blue-600 mt-2">{processingStatus}</div>}
      {processingQueue.length > 0 && (
        <div className="text-blue-700 mt-2 text-sm">
          Processing queue: {queueProgress.current} / {queueProgress.total}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <form onSubmit={handleSearch} className="relative mb-4">
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoComplete="off"
          />
          <SearchIcon className="absolute left-3 top-3 text-gray-400" size={20} />
          {isLoading && <LoadingSpinner className="absolute right-3 top-3" />}
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-12 bg-white border border-gray-200 rounded shadow z-10">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => setSearchTerm(s)}
                >
                  {highlightMatch(s, searchTerm)}
                </li>
              ))}
            </ul>
          )}
        </form>
        <div className="flex space-x-2 mb-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border p-2 rounded text-sm"
            placeholder="Filter by upload date"
          />
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="border p-2 rounded text-sm"
          >
            <option value="">All file types</option>
            <option value=".pdf">PDF</option>
            <option value=".doc">DOC</option>
            <option value=".docx">DOCX</option>
          </select>
        </div>
        <div className="mb-3">
          <h2 className="font-semibold">{machine.name} - Documentation</h2>
        </div>
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No documents found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => {
              const matchInTitle = doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
              const matchInText =
                doc.extracted_text &&
                doc.extracted_text.toLowerCase().includes(searchTerm.toLowerCase());
              const snippet = matchInText ? getSnippet(doc.extracted_text!, searchTerm) : '';
              return (
                <button
                  key={doc.id}
                  onClick={() => onSelectManual(doc)}
                  className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-md text-blue-800 mr-3">
                      <FolderIcon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{highlightMatch(doc.filename, searchTerm)}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                      {snippet && (
                        <p className="text-xs text-gray-700 mt-1">
                          <span className="font-semibold">Excerpt:</span>{' '}
                          {highlightMatch(snippet, searchTerm)}
                        </p>
                      )}
                      {doc.processing_status && (
                        <p className="text-xs mt-1">
                          Status:{' '}
                          <span
                            className={
                              doc.processing_status === 'completed'
                                ? 'text-green-600'
                                : doc.processing_status === 'processing'
                                  ? 'text-blue-600'
                                  : doc.processing_status === 'failed'
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                            }
                          >
                            {doc.processing_status}
                          </span>
                          {doc.processing_status === 'completed' &&
                            doc.page_count !== undefined && (
                              <span className="ml-2 text-gray-500">Pages: {doc.page_count}</span>
                            )}
                          {doc.processing_status === 'failed' && doc.error_message && (
                            <span className="ml-2 text-red-600">Error: {doc.error_message}</span>
                          )}
                          {doc.processing_status === 'failed' && (
                            <button
                              className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRetryProcessing(doc);
                              }}
                              disabled={processing}
                            >
                              {processing ? 'Retrying...' : 'Retry'}
                            </button>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
