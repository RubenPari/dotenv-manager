import axios, { AxiosInstance } from 'axios';
import { readCredentials } from '../config';

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (apiClient) return apiClient;

  const config = readCredentials();

  apiClient = axios.create({
    baseURL: config.apiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  apiClient.interceptors.request.use((reqConfig) => {
    if (config.accessToken) {
      reqConfig.headers.Authorization = `Bearer ${config.accessToken}`;
    }
    return reqConfig;
  });

  apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        console.error('Authentication expired. Please run `dm login` again.');
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
}

export function getPublicClient(): AxiosInstance {
  const config = readCredentials();
  return axios.create({
    baseURL: config.apiUrl,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getProjectIdBySlug(slug: string): Promise<string> {
  const api = getApiClient();
  const { data: projects } = await api.get('/api/v1/projects');
  const project = projects.find((p: any) => p.slug === slug);
  
  if (!project) {
    throw new Error(`Project "${slug}" not found`);
  }
  
  return project.id;
}
