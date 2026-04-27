/**
 * Dashboard page
 * @module web/app/pages/dashboard/dashboard.component
 * @description Lists projects and allows basic project CRUD.
 */
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { CreateProjectDto, Project } from '../../models';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  protected readonly projects = signal<Project[]>([]);
  protected readonly loading = signal(true);
  protected readonly showCreateModal = signal(false);
  protected readonly newName = signal('');
  protected readonly newDescription = signal('');
  protected readonly error = signal('');

  ngOnInit(): void {
    this.loadProjects();
  }

  /**
   * Load projects for the current user.
   */
  protected loadProjects(): void {
    this.loading.set(true);
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  /**
   * Create a new project using the modal form fields.
   */
  protected createProject(): void {
    const name = this.newName().trim();
    if (!name) {
      this.error.set('Project name is required');
      return;
    }

    const data: CreateProjectDto = {
      name,
      description: this.newDescription().trim() || undefined,
    };

    this.projectService.createProject(data).subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.newName.set('');
        this.newDescription.set('');
        this.error.set('');
        this.loadProjects();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to create project');
      },
    });
  }

  /**
   * Delete a project after user confirmation.
   */
  protected deleteProject(project: Project): void {
    if (
      !confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)
    ) {
      return;
    }

    this.projectService.deleteProject(project.id).subscribe({
      next: () => this.loadProjects(),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to delete project');
      },
    });
  }

  /**
   * Logout the current user.
   */
  protected logout(): void {
    this.authService.logout().subscribe();
  }

  /**
   * Compute total variable count across all environments.
   */
  protected getVarCount(project: Project): number {
    return project.envs?.reduce((sum, env) => sum + (env._count?.variables ?? 0), 0) ?? 0;
  }
}
