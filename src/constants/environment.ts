export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

export const GITHUB_API_BASE_URL = process.env.GITHUB_API_BASE_URL;
export const GITHUB_PERSONAL_ACCESS_TOKEN =
  process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

export const GOOGLE_APPLICATION_CREDENTIALS =
  process.env.GOOGLE_APPLICATION_CREDENTIALS;
export const GOOGLE_FIREBASE_STORAGE_BUCKET =
  process.env.GOOGLE_FIREBASE_STORAGE_BUCKET;
