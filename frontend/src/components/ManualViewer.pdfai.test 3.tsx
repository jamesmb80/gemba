import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ManualViewer } from './ManualViewer';

jest.mock('../lib/supabaseClient', () => {
  let docs: any[] = [
    {
      id: '1',
      machine_id: '1',
      uploader_id: 'user1',
      filename: 'manual.pdf',
      storage_path: 'documents/manual.pdf',
      uploaded_at: new Date().toISOString(),
      extracted_text: 'Test PDF content for AI search',
    }
  ];
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
      }))
    }
  };
});

jest.mock('pdfjs-dist/build/pdf', () => ({
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: jest.fn(() => Promise.resolve({ getTextContent: () => Promise.resolve({ items: [{ str: 'Test PDF content for AI search' }] }) }))
    })
  }))
}));
jest.mock('pdfjs-dist/build/pdf.worker.entry', () => {});

describe('ManualViewer PDF/AI', () => {
  it('searches by extracted PDF text', async () => {
    render(
      <ManualViewer
        machine={{ id: '1', name: 'Test Machine' }}
        onSelectManual={jest.fn()}
        onBack={jest.fn()}
      />
    );
    const searchInput = screen.getByPlaceholderText(/Search documentation/i);
    fireEvent.change(searchInput, { target: { value: 'AI search' } });
    await waitFor(() => expect(screen.getByText('manual.pdf')).toBeInTheDocument());
  });
}); 