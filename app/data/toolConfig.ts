// This file is intentionally empty - use toolConfig.tsx instead
import React from 'react';
import { FiFileText } from 'react-icons/fi';

export interface ToolConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  acceptedFiles: string[];
  outputFormat: string;
  steps: string[];
  features: string[];
  additionalInfo?: string;
  relatedTools?: string[];
}

// Empty default export
const toolConfigs: Record<string, ToolConfig> = {};

export default toolConfigs; 