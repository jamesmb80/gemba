'use client';

import React, { useState } from 'react';
import {
  getAllFeatureFlags,
  getFeatureFlagInfo,
  toggleFeatureFlag,
  FeatureFlag,
} from '@/lib/featureFlags';
import { getConfig } from '@/config/environment';
import { Shield, AlertTriangle, ToggleLeft, ToggleRight, Info } from 'lucide-react';

interface FeatureFlagItemProps {
  flag: FeatureFlag;
  enabled: boolean;
  onToggle: (flag: FeatureFlag, enabled: boolean) => void;
  isProduction: boolean;
}

const FeatureFlagItem: React.FC<FeatureFlagItemProps> = ({
  flag,
  enabled,
  onToggle,
  isProduction,
}) => {
  const info = getFeatureFlagInfo(flag);

  const priorityColors = {
    critical: 'text-red-600 bg-red-50',
    high: 'text-orange-600 bg-orange-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-blue-600 bg-blue-50',
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="font-medium text-gray-900">{flag}</h3>
          <span
            className={`px-2 py-1 text-xs rounded-full ${priorityColors[info.rollbackPriority]}`}
          >
            {info.rollbackPriority} priority
          </span>
        </div>

        <button
          onClick={() => onToggle(flag, !enabled)}
          disabled={isProduction}
          className={`${isProduction ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isProduction ? 'Cannot toggle in production' : `Toggle ${flag}`}
        >
          {enabled ? (
            <ToggleRight className="w-8 h-8 text-green-600" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-gray-400" />
          )}
        </button>
      </div>

      <p className="text-sm text-gray-600">{info.description}</p>

      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${enabled ? 'text-green-600' : 'text-gray-500'}`}>
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
        {flag === 'CHUNKING_ENABLED' && (
          <span className="text-xs text-gray-500">
            Default: {info.defaultValue ? 'Enabled' : 'Disabled'}
          </span>
        )}
      </div>
    </div>
  );
};

export default function FeatureFlagsPanel() {
  const [flags, setFlags] = useState(getAllFeatureFlags());
  const [error, setError] = useState<string | null>(null);
  const config = getConfig();
  const isProduction = config.environment === 'production';

  const handleToggle = (flag: FeatureFlag, enabled: boolean) => {
    if (isProduction) {
      setError('Feature flags cannot be toggled in production environment');
      return;
    }

    try {
      toggleFeatureFlag(flag, enabled);
      // Refresh flags state
      setFlags(getAllFeatureFlags());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle feature flag');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Shield className="w-6 h-6" />
          <span>Feature Flags</span>
        </h2>

        {isProduction && (
          <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Production Mode - Read Only</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Feature Flag Configuration</p>
            <p className="mt-1">
              In production, feature flags must be controlled via environment variables. Set{' '}
              <code className="bg-blue-100 px-1 py-0.5 rounded">CHUNKING_ENABLED=true</code> to
              enable document chunking.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {(Object.keys(flags) as FeatureFlag[]).map((flag) => (
          <FeatureFlagItem
            key={flag}
            flag={flag}
            enabled={flags[flag]}
            onToggle={handleToggle}
            isProduction={isProduction}
          />
        ))}
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-900 mb-2">Environment Variables</h3>
        <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs">
          <div className="space-y-1">
            <div>VECTOR_SEARCH_ENABLED={String(flags.VECTOR_SEARCH_ENABLED)}</div>
            <div>MULTI_TENANT_ENABLED={String(flags.MULTI_TENANT_ENABLED)}</div>
            <div>ANALYTICS_ENABLED={String(flags.ANALYTICS_ENABLED)}</div>
            <div className="text-orange-600 font-bold">
              CHUNKING_ENABLED={String(flags.CHUNKING_ENABLED)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
