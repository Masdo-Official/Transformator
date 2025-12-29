export enum ConversionStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ConversionResult {
  code: string;
  explanation?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  snippet: string;
}