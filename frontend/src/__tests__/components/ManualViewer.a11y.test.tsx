import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ManualViewer } from '../../components/ManualViewer';

expect.extend(toHaveNoViolations);

jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            then: (cb: (result: { data: unknown[]; error: null }) => unknown) =>
              cb({ data: [], error: null }),
          })),
        })),
      })),
    })),
  },
}));
jest.mock('pdfjs-dist/build/pdf', () => ({ getDocument: jest.fn() }));
jest.mock('pdfjs-dist/build/pdf.worker.entry', () => {});

describe('ManualViewer accessibility', () => {
  it('has no basic accessibility violations', async () => {
    const { container } = render(
      <ManualViewer
        machine={{ id: '1', name: 'Test Machine' }}
        onSelectManual={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
