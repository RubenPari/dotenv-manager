/**
 * Web app models
 * @module web/app/models/index
 * @description TypeScript interfaces used by web components/services.
 */
export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  envs?: Environment[];
}

export interface Environment {
  id: string;
  projectId: string;
  name: string;
  _count?: { variables: number };
  variables?: Variable[];
}

export interface Variable {
  id: string;
  key: string;
  value: string | null;
  isSecret: boolean;
  isRequired: boolean;
  description?: string;
}

export interface DiffEntry {
  key: string;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
  env1?: string;
  env2?: string;
}

export interface AuditLog {
  id: string;
  envId: string;
  action: string;
  key: string;
  actorId: string;
  createdAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface CreateEnvDto {
  name: string;
}

export interface VariableDto {
  key: string;
  value?: string | null;
  isSecret: boolean;
  isRequired: boolean;
  description?: string;
}
