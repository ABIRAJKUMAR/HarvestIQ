import axios from 'axios';
import type {
  AnalysisRequest,
  AnalysisResponse,
  BaselineCompareRequest,
  BaselineCompareResponse,
  HistoryItem
} from '../types/simulator';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const api = {
  // Core Analysis Pipeline
  analyzeLot: async (payload: AnalysisRequest): Promise<AnalysisResponse> => {
    const response = await apiClient.post<AnalysisResponse>('/analyze', payload);
    return response.data;
  },

  // Baseline Comparison
  compareBaseline: async (payload: BaselineCompareRequest): Promise<BaselineCompareResponse> => {
    const response = await apiClient.post<BaselineCompareResponse>('/baseline-compare', payload);
    return response.data;
  },

  // Reference Data
  getCrops: async () => {
    const response = await apiClient.get('/crops');
    return response.data;
  },

  getRegions: async () => {
    const response = await apiClient.get('/regions');
    return response.data;
  },

  getDataSources: async () => {
    const response = await apiClient.get('/data-sources');
    return response.data;
  },

  // History
  getHistory: async (limit: number = 50): Promise<HistoryItem[]> => {
    const response = await apiClient.get<HistoryItem[]>(`/history?limit=${limit}`);
    return response.data;
  },

  getHistoryDetail: async (id: number): Promise<any> => {
    const response = await apiClient.get(`/history/${id}`);
    return response.data;
  },

  // System Health
  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  }
};
