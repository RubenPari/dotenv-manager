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

  getProjects(): Observable<Project[]> {
    return this.api.get<Project[]>('/projects');
  }

  createProject(data: CreateProjectDto): Observable<Project> {
    return this.api.post<Project>('/projects', data);
  }

  getProject(id: string): Observable<Project> {
    return this.api.get<Project>(`/projects/${id}`);
  }

  updateProject(id: string, data: CreateProjectDto): Observable<Project> {
    return this.api.put<Project>(`/projects/${id}`, data);
  }

  deleteProject(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/projects/${id}`);
  }

  getEnvironments(projectId: string): Observable<Environment[]> {
    return this.api.get<Environment[]>(`/projects/${projectId}/envs`);
  }

  createEnvironment(projectId: string, data: CreateEnvDto): Observable<Environment> {
    return this.api.post<Environment>(`/projects/${projectId}/envs`, data);
  }

  deleteEnvironment(projectId: string, envName: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/projects/${projectId}/envs/${envName}`);
  }

  getVariables(projectId: string, envName: string): Observable<Variable[]> {
    return this.api.get<Variable[]>(`/projects/${projectId}/envs/${envName}`);
  }

  updateVariables(
    projectId: string,
    envName: string,
    variables: VariableDto[],
  ): Observable<Variable[]> {
    return this.api.put<Variable[]>(`/projects/${projectId}/envs/${envName}`, variables);
  }

  exportEnvironment(
    projectId: string,
    envName: string,
    format: string = 'env',
  ): Observable<string> {
    return this.api.get<string>(`/projects/${projectId}/envs/${envName}/export`, { format });
  }

  diffEnvironments(projectId: string, env1: string, env2: string): Observable<DiffEntry[]> {
    return this.api.get<DiffEntry[]>(`/projects/${projectId}/envs/${env1}/diff/${env2}`);
  }

  importEnvironment(
    projectId: string,
    envName: string,
    content: string,
  ): Observable<{ imported: number }> {
    return this.api.post<{ imported: number }>(`/projects/${projectId}/envs/${envName}/import`, {
      content,
    });
  }

  getHistory(projectId: string, envName: string, limit: number = 20): Observable<AuditLog[]> {
    return this.api.get<AuditLog[]>(`/projects/${projectId}/envs/${envName}/history`, {
      limit: String(limit),
    });
  }
}
