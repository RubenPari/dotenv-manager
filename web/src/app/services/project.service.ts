/**
 * Project service (web)
 * @module web/app/services/project.service
 * @description Typed API calls for projects, environments, variables, diffs and history.
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Project,
  Environment,
  Variable,
  DiffEntry,
  AuditLog,
  CreateProjectDto,
  CreateEnvDto,
  VariableDto,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private api: ApiService) {}

  /**
   * List all projects visible to the current user.
   */
  getProjects(): Observable<Project[]> {
    return this.api.get<Project[]>('/projects');
  }

  /**
   * Create a new project.
   */
  createProject(data: CreateProjectDto): Observable<Project> {
    return this.api.post<Project>('/projects', data);
  }

  /**
   * Get a project by id.
   */
  getProject(id: string): Observable<Project> {
    return this.api.get<Project>(`/projects/${id}`);
  }

  /**
   * Update a project.
   */
  updateProject(id: string, data: CreateProjectDto): Observable<Project> {
    return this.api.put<Project>(`/projects/${id}`, data);
  }

  /**
   * Delete a project.
   */
  deleteProject(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/projects/${id}`);
  }

  /**
   * List environments for a project.
   */
  getEnvironments(projectId: string): Observable<Environment[]> {
    return this.api.get<Environment[]>(`/projects/${projectId}/envs`);
  }

  /**
   * Create an environment under a project.
   */
  createEnvironment(projectId: string, data: CreateEnvDto): Observable<Environment> {
    return this.api.post<Environment>(`/projects/${projectId}/envs`, data);
  }

  /**
   * Delete an environment under a project.
   */
  deleteEnvironment(projectId: string, envName: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/projects/${projectId}/envs/${envName}`);
  }

  /**
   * List variables in an environment.
   */
  getVariables(projectId: string, envName: string): Observable<Variable[]> {
    return this.api.get<Variable[]>(`/projects/${projectId}/envs/${envName}`);
  }

  /**
   * Upsert variables for an environment (full replace semantics).
   */
  updateVariables(
    projectId: string,
    envName: string,
    variables: VariableDto[],
  ): Observable<Variable[]> {
    return this.api.put<Variable[]>(`/projects/${projectId}/envs/${envName}`, variables);
  }

  /**
   * Export variables for an environment.
   */
  exportEnvironment(
    projectId: string,
    envName: string,
    format: string = 'env',
  ): Observable<string> {
    return this.api.get<string>(`/projects/${projectId}/envs/${envName}/export`, { format });
  }

  /**
   * Diff variables between two environments.
   */
  diffEnvironments(projectId: string, env1: string, env2: string): Observable<DiffEntry[]> {
    return this.api.get<DiffEntry[]>(`/projects/${projectId}/envs/${env1}/diff/${env2}`);
  }

  /**
   * Import variable content into an environment.
   */
  importEnvironment(
    projectId: string,
    envName: string,
    content: string,
  ): Observable<{ imported: number }> {
    return this.api.post<{ imported: number }>(`/projects/${projectId}/envs/${envName}/import`, {
      content,
    });
  }

  /**
   * Get audit history for an environment.
   */
  getHistory(projectId: string, envName: string, limit: number = 20): Observable<AuditLog[]> {
    return this.api.get<AuditLog[]>(`/projects/${projectId}/envs/${envName}/history`, {
      limit: String(limit),
    });
  }
}
