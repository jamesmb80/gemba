import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface {{FeatureName}}Props {
  machineId?: string;
  onComplete?: () => void;
  className?: string;
}

interface {{FeatureName}}State {
  // TODO: Define state interface based on feature requirements
  isLoading: boolean;
  error: string | null;
  data: any | null;
}

/**
 * {{FeatureName}} Component
 * 
 * {{FeatureDescription}}
 * 
 * Manufacturing Considerations:
 * - Large touch targets for gloved operation (min 44x44px)
 * - High contrast colors for factory lighting
 * - Offline-capable with sync when connected
 * - Clear visual feedback for all actions
 */
export const {{FeatureName}}: React.FC<{{FeatureName}}Props> = ({
  machineId,
  onComplete,
  className = ''
}) => {
  const supabase = useSupabase();
  const { showToast } = useToast();
  
  const [state, setState] = useState<{{FeatureName}}State>({
    isLoading: false,
    error: null,
    data: null
  });

  // Manufacturing-optimized touch handling
  const handleTouchAction = (action: string) => {
    // Haptic feedback for touch confirmation
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Visual feedback
    showToast({
      title: `${action} initiated`,
      variant: 'info'
    });
  };

  // Offline-capable data management
  useEffect(() => {
    const loadData = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        // Check offline cache first
        const cachedData = localStorage.getItem(`{{feature}}_${machineId}`);
        if (cachedData && !navigator.onLine) {
          setState(prev => ({
            ...prev,
            data: JSON.parse(cachedData),
            isLoading: false
          }));
          return;
        }

        // Fetch from Supabase
        const { data, error } = await supabase
          .from('{{table_name}}')
          .select('*')
          .eq('machine_id', machineId);

        if (error) throw error;

        // Cache for offline use
        localStorage.setItem(
          `{{feature}}_${machineId}`,
          JSON.stringify(data)
        );

        setState(prev => ({
          ...prev,
          data,
          isLoading: false,
          error: null
        }));
      } catch (error) {
        console.error('{{FeatureName}} data load error:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to load data. Using offline mode.',
          isLoading: false
        }));
      }
    };

    if (machineId) {
      loadData();
    }
  }, [machineId, supabase]);

  // Handle completion with safety check
  const handleComplete = () => {
    // Manufacturing safety: Confirm before completion
    if (window.confirm('Confirm task completion? This action cannot be undone.')) {
      handleTouchAction('Completion');
      onComplete?.();
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card className={`manufacturing-component ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{{Feature Display Name}}</span>
          {!navigator.onLine && (
            <span className="text-sm text-yellow-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              Offline Mode
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-800">{state.error}</p>
          </div>
        )}

        {/* Main feature content */}
        <div className="space-y-4">
          {/* TODO: Implement feature-specific UI */}
          
          {/* Manufacturing-optimized action buttons */}
          <div className="flex gap-4 mt-6">
            <Button
              onClick={() => handleTouchAction('Action 1')}
              size="lg"
              className="min-h-[44px] min-w-[120px]"
            >
              Primary Action
            </Button>
            
            <Button
              onClick={handleComplete}
              variant="success"
              size="lg"
              className="min-h-[44px] min-w-[120px]"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Complete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Manufacturing-specific styles
const styles = `
  .manufacturing-component {
    /* High contrast for factory lighting */
    --min-contrast-ratio: 4.5;
    
    /* Large touch targets */
    button {
      min-height: 44px;
      min-width: 44px;
    }
    
    /* Clear focus indicators */
    *:focus {
      outline: 3px solid #2563eb;
      outline-offset: 2px;
    }
    
    /* Prevent accidental touches */
    .danger-action {
      margin-top: 20px;
      border: 2px solid #dc2626;
    }
  }
`;