import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ManualViewer } from '../../components/ManualViewer';

jest.mock('../../lib/supabaseClient', () => {
  const docs: unknown[] = [
    {
      id: '1',
      machine_id: '1',
      uploader_id: 'user1',
      filename: 'manual.pdf',
      storage_path: 'documents/manual.pdf',
      uploaded_at: new Date().toISOString(),
    },
  ];
  const queryMock = {
    select: jest.fn(function () {
      return this;
    }),
    or: jest.fn(function () {
      return this;
    }),
    eq: jest.fn(function () {
      return this;
    }),
    order: jest.fn(function () {
      return this;
    }),
    gte: jest.fn(function () {
      return this;
    }),
    ilike: jest.fn(function () {
      return this;
    }),
    then: (cb: (result: { data: unknown[]; error: null }) => unknown) =>
      cb({ data: docs, error: null }),
  };
  return {
    supabase: {
      from: jest.fn(() => queryMock),
      insert: jest.fn(() => queryMock),
    },
  };
});

jest.mock('pdfjs-dist/build/pdf', () => ({
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: jest.fn(() =>
        Promise.resolve({
          getTextContent: () => Promise.resolve({ items: [{ str: 'Test PDF content' }] }),
        }),
      ),
    }),
  })),
}));
jest.mock('pdfjs-dist/build/pdf.worker.entry', () => {});

describe('ManualViewer integration', () => {
  it('uploads a PDF and shows it in the document list', async () => {
    render(
      <ManualViewer
        machine={{ id: '1', name: 'Test Machine' }}
        onSelectManual={jest.fn()}
        onBack={jest.fn()}
      />,
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
