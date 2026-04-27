/**
 * Dashboard page
 * @module web/app/pages/dashboard/dashboard.component
 */
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  model,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ProjectService } from '../../services/project.service';
import { ToastService } from '../../services/toast.service';
import { CreateProjectDto, Project } from '../../models';
import { UiButtonComponent } from '../../components/ui-button.component';
import { UiCardComponent } from '../../components/ui-card.component';
import { UiInputComponent } from '../../components/ui-input.component';
import { UiModalComponent } from '../../components/ui-modal.component';
import { UiEmptyStateComponent } from '../../components/ui-empty-state.component';
import { UiSkeletonComponent } from '../../components/ui-skeleton.component';
import { UiBadgeComponent } from '../../components/ui-badge.component';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [
    LucideAngularModule,
    UiButtonComponent,
    UiCardComponent,
    UiInputComponent,
    UiModalComponent,
    UiEmptyStateComponent,
    UiSkeletonComponent,
    UiBadgeComponent,
    RelativeTimePipe,
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly toasts = inject(ToastService);
  private readonly _router = inject(Router);

  protected readonly projects = signal<Project[]>([]);
  protected readonly loading = signal(true);
  protected readonly showCreateModal = model(false);
  protected readonly newName = model('');
  protected readonly newDescription = model('');
  protected readonly search = signal('');

  protected readonly showDeleteModal = model(false);
  protected readonly projectToDelete = signal<Project | null>(null);

  protected readonly showRenameModal = model(false);
  protected readonly projectToRename = signal<Project | null>(null);
  protected readonly renameName = model('');
  protected readonly renameDescription = model('');

  protected readonly openMenuId = signal<string | null>(null);

  protected readonly filteredProjects = computed(() => {
    const q = this.search().trim().toLowerCase();
    const list = this.projects();
    if (!q) {
      return list;
    }
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.slug.toLowerCase().includes(q),
    );
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  protected loadProjects(): void {
    this.loading.set(true);
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toasts.show('Failed to load projects', 'error');
      },
    });
  }

  protected createProject(): void {
    const name = this.newName().trim();
    if (!name) {
      this.toasts.show('Project name is required', 'error');
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
        this.toasts.show('Project created', 'success');
        this.loadProjects();
      },
      error: (err) => {
        this.toasts.show(err.error?.message || 'Failed to create project', 'error');
      },
    });
  }

  protected openDelete(p: Project): void {
    this.openMenuId.set(null);
    this.projectToDelete.set(p);
    this.showDeleteModal.set(true);
  }

  protected confirmDelete(): void {
    const p = this.projectToDelete();
    if (!p) {
      return;
    }
    this.projectService.deleteProject(p.id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.projectToDelete.set(null);
        this.toasts.show('Project deleted', 'info');
        this.loadProjects();
      },
      error: (err) => {
        this.toasts.show(err.error?.message || 'Failed to delete project', 'error');
      },
    });
  }

  protected openRename(p: Project): void {
    this.openMenuId.set(null);
    this.projectToRename.set(p);
    this.renameName.set(p.name);
    this.renameDescription.set(p.description ?? '');
    this.showRenameModal.set(true);
  }

  protected saveRename(): void {
    const p = this.projectToRename();
    const name = this.renameName().trim();
    if (!p || !name) {
      return;
    }
    this.projectService
      .updateProject(p.id, {
        name,
        description: this.renameDescription().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.showRenameModal.set(false);
          this.projectToRename.set(null);
          this.toasts.show('Project updated', 'success');
          this.loadProjects();
        },
        error: (err) => {
          this.toasts.show(err.error?.message || 'Failed to update project', 'error');
        },
      });
  }

  protected getVarCount(project: Project): number {
    return project.envs?.reduce((sum, env) => sum + (env._count?.variables ?? 0), 0) ?? 0;
  }

  protected envBadgeVariant(
    n: string,
  ): 'env-dev' | 'env-staging' | 'env-prod' | 'neutral' {
    const l = n.toLowerCase();
    if (l === 'dev' || l === 'development' || l === 'local') {
      return 'env-dev';
    }
    if (l === 'staging' || l === 'stage') {
      return 'env-staging';
    }
    if (l === 'prod' || l === 'production') {
      return 'env-prod';
    }
    return 'neutral';
  }

  protected goProject(p: Project): void {
    void this._router.navigate(['/project', p.slug]);
  }

  protected toggleMenu(id: string, e: Event): void {
    e.stopPropagation();
    this.openMenuId.update((c) => (c === id ? null : id));
  }

  @HostListener('document:click')
  protected onDocClick(): void {
    this.openMenuId.set(null);
  }
}
