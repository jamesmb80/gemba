import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { {{FeatureName}} } from './{{FeatureName}}';
import { useSupabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/useToast';

// Mock dependencies
jest.mock('@/lib/supabaseClient');
jest.mock('@/hooks/useToast');

describe('{{FeatureName}}', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis()
  };

  const mockShowToast = jest.fn();

  beforeEach(() => {
    (useSupabase as jest.Mock).mockReturnValue(mockSupabase);
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    
    // Reset localStorage
    localStorage.clear();
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
    
    // Mock vibrate API
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Manufacturing Floor Scenarios', () => {
    it('handles rapid repeated touches without double-submission (gloved operation)', async () => {
      const onComplete = jest.fn();
      render(<{{FeatureName}} machineId="M001" onComplete={onComplete} />);

      const button = screen.getByText('Primary Action');
      
      // Simulate rapid gloved touches
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        // Should only process once despite multiple touches
        expect(mockShowToast).toHaveBeenCalledTimes(1);
      });
    });

    it('provides haptic feedback on touch actions', async () => {
      render(<{{FeatureName}} machineId="M001" />);

      const button = screen.getByText('Primary Action');
      fireEvent.click(button);

      expect(navigator.vibrate).toHaveBeenCalledWith(50);
    });

    it('maintains minimum touch target size for gloved operation', () => {
      render(<{{FeatureName}} machineId="M001" />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const height = parseInt(styles.minHeight);
        const width = parseInt(styles.minWidth);
        
        expect(height).toBeGreaterThanOrEqual(44);
        expect(width).toBeGreaterThanOrEqual(44);
      });
    });

    it('works in offline mode with cached data', async () => {
      // Set offline
      Object.defineProperty(navigator, 'onLine', { value: false });
      
      // Pre-populate cache
      const cachedData = { id: 1, status: 'active' };
      localStorage.setItem('{{feature}}_M001', JSON.stringify(cachedData));

      render(<{{FeatureName}} machineId="M001" />);

      // Should not attempt API call
      expect(mockSupabase.from).not.toHaveBeenCalled();
      
      // Should show offline indicator
      expect(screen.getByText('Offline Mode')).toBeInTheDocument();
    });

    it('requires confirmation for safety-critical actions', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
      const onComplete = jest.fn();
      
      render(<{{FeatureName}} machineId="M001" onComplete={onComplete} />);

      const completeButton = screen.getByText('Complete');
      fireEvent.click(completeButton);

      expect(mockConfirm).toHaveBeenCalledWith(
        'Confirm task completion? This action cannot be undone.'
      );
      expect(onComplete).not.toHaveBeenCalled();

      mockConfirm.mockRestore();
    });

    it('supports shift handover with persistent state', async () => {
      const { rerender } = render(<{{FeatureName}} machineId="M001" />);

      // Simulate work in progress
      // TODO: Add feature-specific state changes

      // Simulate shift change (component unmount/remount)
      rerender(<div />);
      rerender(<{{FeatureName}} machineId="M001" />);

      // State should be restored from localStorage
      // TODO: Verify feature-specific state restoration
    });
  });

  describe('Accessibility Compliance', () => {
    it('provides proper ARIA labels for screen readers', () => {
      render(<{{FeatureName}} machineId="M001" />);

      // Check for required ARIA attributes
      const mainContent = screen.getByRole('article');
      expect(mainContent).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', async () => {
      render(<{{FeatureName}} machineId="M001" />);

      const firstButton = screen.getByText('Primary Action');
      const completeButton = screen.getByText('Complete');

      // Tab navigation
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);

      userEvent.tab();
      expect(document.activeElement).toBe(completeButton);
    });

    it('maintains focus visibility indicators', () => {
      render(<{{FeatureName}} machineId="M001" />);

      const button = screen.getByText('Primary Action');
      button.focus();

      const styles = window.getComputedStyle(button);
      expect(styles.outlineWidth).toBe('3px');
      expect(styles.outlineColor).toBe('rgb(37, 99, 235)');
    });
  });

  describe('Error Handling', () => {
    it('displays user-friendly error messages', async () => {
      mockSupabase.eq.mockRejectedValueOnce(new Error('Network error'));

      render(<{{FeatureName}} machineId="M001" />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load data/)).toBeInTheDocument();
      });
    });

    it('falls back to cached data on network failure', async () => {
      const cachedData = { id: 1, status: 'cached' };
      localStorage.setItem('{{feature}}_M001', JSON.stringify(cachedData));

      mockSupabase.eq.mockRejectedValueOnce(new Error('Network error'));

      render(<{{FeatureName}} machineId="M001" />);

      await waitFor(() => {
        // Should use cached data instead of showing error
        expect(screen.queryByText(/Failed to load/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('renders within performance budget', () => {
      const startTime = performance.now();
      
      render(<{{FeatureName}} machineId="M001" />);
      
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100); // 100ms budget
    });

    it('debounces rapid state updates', async () => {
      // TODO: Add feature-specific rapid update test
    });
  });
});

describe('{{FeatureName}} Integration Tests', () => {
  it('integrates with machine workflow', async () => {
    // TODO: Add integration test with full machine context
  });

  it('syncs data when returning online', async () => {
    // Start offline
    Object.defineProperty(navigator, 'onLine', { value: false });
    
    render(<{{FeatureName}} machineId="M001" />);

    // Make changes while offline
    // TODO: Add feature-specific offline changes

    // Go back online
    Object.defineProperty(navigator, 'onLine', { value: true });
    window.dispatchEvent(new Event('online'));

    await waitFor(() => {
      // Verify sync occurred
      expect(mockSupabase.insert).toHaveBeenCalled();
    });
  });
});