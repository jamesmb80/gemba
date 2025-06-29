import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ManualViewer } from './ManualViewer';

jest.mock('../lib/supabaseClient', () => {
  let docs: any[] = [];
  return {
    supabase: {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              then: (cb: any) => cb({ data: docs, error: null })
            }))
          }))
        })),
        insert: jest.fn(() => ({
          then: (cb: any) => {
            docs.push({
              id: String(docs.length + 1),
              machine_id: '1',
              uploader_id: 'user1',
              filename: 'manual.pdf',
              storage_path: 'documents/manual.pdf',
              uploaded_at: new Date().toISOString(),
            });
            return cb({ data: docs, error: null });
          }
        }))
      }))
    }
  };
});

jest.mock('pdfjs-dist/build/pdf', () => ({
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: jest.fn(() => Promise.resolve({ getTextContent: () => Promise.resolve({ items: [{ str: 'Test PDF content' }] }) }))
    })
  }))
}));
jest.mock('pdfjs-dist/build/pdf.worker.entry', () => {});

describe('ManualViewer integration', () => {
  it('uploads a PDF and shows it in the document list', async () => {
    render(
      <ManualViewer
        machine={{ id: '1', name: 'Test Machine' }}
        onSelectManual={jest.fn()}
        onBack={jest.fn()}
      />
    );
    const file = new File(['dummy content'], 'manual.pdf', { type: 'application/pdf' });
    // Mock arrayBuffer for JSDOM
    Object.defineProperty(file, 'arrayBuffer', {
      value: () => Promise.resolve(new ArrayBuffer(8)),
    });
    const input = screen.getByLabelText(/Upload Documents/i);
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(screen.getByText('manual.pdf')).toBeInTheDocument());
  });
}); 