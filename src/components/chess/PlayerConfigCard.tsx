import React from 'react';
import { PlayerConfig, PROVIDERS, MODELS } from '@/config/models';
import { Select } from '@/components/ui/Select';

interface PlayerConfigCardProps {
  title: string;
  config: PlayerConfig;
  onChange: (newConfig: PlayerConfig) => void;
}

export const PlayerConfigCard: React.FC<PlayerConfigCardProps> = ({ title, config, onChange }) => {
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value;
    const defaultModel = MODELS[newProvider]?.[0] || '';
    onChange({
      provider: newProvider,
      model: newProvider === 'Human' ? '' : defaultModel
    });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...config,
      model: e.target.value
    });
  };

  const providerOptions = PROVIDERS.map(p => ({ value: p, label: p }));
  const modelOptions = (MODELS[config.provider] || []).map(m => ({ value: m, label: m }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      
      <div className="space-y-4">
        <Select
          label="Provider"
          value={config.provider}
          options={providerOptions}
          onChange={handleProviderChange}
        />

        {config.provider !== 'Human' && modelOptions.length > 0 && (
          <Select
            label="Model"
            value={config.model}
            options={modelOptions}
            onChange={handleModelChange}
          />
        )}
      </div>
    </div>
  );
};
