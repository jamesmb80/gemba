import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation((cb) => cb({ data: [], error: null })),
  },
}));

jest.mock('pdfjs-dist/build/pdf', () => ({
  getDocument: jest
    .fn()
    .mockReturnValue({ promise: Promise.resolve({ numPages: 1, getPage: jest.fn() }) }),
}));
jest.mock('pdfjs-dist/build/pdf.worker.entry', () => {});

import { ManualViewer } from '../../components/ManualViewer';

describe('ManualViewer', () => {
  it('renders upload button and search bar', () => {
    render(
      <ManualViewer
        machine={{ id: '1', name: 'Test Machine' }}
        onSelectManual={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(screen.getByText(/Upload Documents/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search documentation/i)).toBeInTheDocument();
  });

  it('shows empty state when no documents', () => {
    render(
      <ManualViewer
        machine={{ id: '1', name: 'Test Machine' }}
        onSelectManual={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(screen.getByText(/No documents found/i)).toBeInTheDocument();
  });
});
