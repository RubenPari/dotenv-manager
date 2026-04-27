/**
 * CLI API client
 * @module cli/api/client
 * @description Axios clients and helpers for calling the Dotenv Manager API from the CLI.
 */
import axios, { AxiosInstance } from 'axios';
import { readCredentials } from '../config';
import type { Project } from '@rubenpari/dotenv-cli-shared';

let apiClient: AxiosInstance | null = null;

/**
 * Get an authenticated API client (cached).
 * Adds `Authorization: Bearer <token>` when available.
 */
export function getApiClient(): AxiosInstance {
  if (apiClient) return apiClient;

  apiClient = axios.create({
    baseURL: readCredentials().apiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  apiClient.interceptors.request.use((reqConfig) => {
    const config = readCredentials();
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
    },
  );

  return apiClient;
}

/**
 * Get an unauthenticated API client (no Authorization header).
 */
export function getPublicClient(): AxiosInstance {
  const config = readCredentials();
  return axios.create({
    baseURL: config.apiUrl,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Resolve a project ID by slug for the currently authenticated user.
 * @param slug - The project slug.
 * @returns The project ID.
 * @throws If the project cannot be found.
 */
export async function getProjectIdBySlug(slug: string): Promise<string> {
  const api = getApiClient();
  const { data: projects } = await api.get<Project[]>('/api/v1/projects');
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    throw new Error(`Project "${slug}" not found`);
  }

  return project.id;
}
