
export interface BusinessInfo {
  industry: string;
  specialty: string;
  companyName: string;
  address: string;
  phone: string;
  website: string;
  facebook: string;
  zalo: string;
}

export interface SEOConfig {
  mainKeywordGroup: string;
  writingTone: string;
  ctaStyle: string;
  authorStyle: string;
}

export interface AIPromptConfig {
  customInstruction: string;
}

export interface CMSConfig {
  cms_login_url: string;
  cms_username: string;
  cms_password: string;
  cms_news_list_url: string;
  cms_news_add_url: string;
}

export interface CMSProfile {
  id: string;
  name: string;
  config: CMSConfig;
  businessInfo: BusinessInfo;
  seoConfig: SEOConfig;
  aiPromptConfig: AIPromptConfig;
}

export interface SEOResult {
  id?: string;
  topic?: string;
  htmlContent: string;
  metadata: {
    title: string;
    description: string;
    keywords: string;
  };
  publishStatus?: {
    success: boolean;
    message?: string;
    error?: string;
    logs?: string[];
  };
}

export interface QueueItem {
  id: string;
  topic: string;
  status: 'waiting' | 'generating' | 'publishing' | 'completed' | 'failed';
  result?: SEOResult;
  error?: string;
}

export enum AppStep {
  CONFIG = 'CONFIG',
  CONTENT_INPUT = 'CONTENT_INPUT',
  PROCESSING = 'PROCESSING'
}
