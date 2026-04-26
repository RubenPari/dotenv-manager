/**
 * Dashboard page
 * @module web/app/pages/dashboard/dashboard.component
 * @description Lists projects and allows basic project CRUD.
 */
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Project, CreateProjectDto } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  showCreateModal = false;
  newName = '';
  newDescription = '';
  error = '';

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  /**
   * Load projects for the current user.
   */
  loadProjects() {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  /**
   * Create a new project using the modal form fields.
   */
  createProject() {
    if (!this.newName.trim()) {
      this.error = 'Project name is required';
      return;
    }

    const data: CreateProjectDto = {
      name: this.newName.trim(),
      description: this.newDescription.trim() || undefined,
    };

    this.projectService.createProject(data).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.newName = '';
        this.newDescription = '';
        this.error = '';
        this.loadProjects();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create project';
      },
    });
  }

  /**
   * Delete a project after user confirmation.
   */
  deleteProject(project: Project) {
    if (
      !confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)
    ) {
      return;
    }

    this.projectService.deleteProject(project.id).subscribe({
      next: () => this.loadProjects(),
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete project';
      },
    });
  }

  /**
   * Logout the current user.
   */
  logout() {
    this.authService.logout();
  }

  /**
   * Compute total variable count across all environments.
   */
  getVarCount(project: Project): number {
    return project.envs?.reduce((sum, env) => sum + (env._count?.variables || 0), 0) || 0;
  }
}
