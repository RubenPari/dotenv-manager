/**
 * Project editor page
 * @module web/app/pages/project-editor/project-editor.component
 */
import { DatePipe, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, model, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ProjectService } from '../../services/project.service';
import { ToastService } from '../../services/toast.service';
import { AuditLog, DiffEntry, Environment, Project, Variable, VariableDto } from '../../models';
import { UiBadgeComponent } from '../../components/ui-badge.component';
import { UiButtonComponent } from '../../components/ui-button.component';
import { UiEmptyStateComponent } from '../../components/ui-empty-state.component';
import { UiInputComponent } from '../../components/ui-input.component';
import { UiModalComponent } from '../../components/ui-modal.component';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

type EditorTab = 'variables' | 'diff' | 'history';

@Component({
  selector: 'app-project-editor',
  imports: [
    FormsModule,
    DatePipe,
    SlicePipe,
    LucideAngularModule,
    UiBadgeComponent,
    UiButtonComponent,
    UiEmptyStateComponent,
    UiInputComponent,
    UiModalComponent,
    RelativeTimePipe,
  ],
  templateUrl: './project-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly project = signal<Project | null>(null);
  protected readonly environments = signal<Environment[]>([]);
  protected readonly activeEnv = signal<string | null>(null);
  protected readonly variables = signal<Variable[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly activeTab = signal<EditorTab>('variables');
  protected readonly keyFilter = model('');
  protected readonly addingVar = model(false);
  protected readonly showAddEnv = model(false);
  protected readonly newEnvName = model('');

  protected readonly showDeleteEnvModal = model(false);
  protected readonly envNameToDelete = signal<string | null>(null);

  protected readonly diffEnv1 = model('');
  protected readonly diffEnv2 = model('');
  protected readonly diffResults = signal<DiffEntry[]>([]);
  protected readonly hideUnchanged = model(false);
  protected readonly diffLoading = signal(false);

  protected readonly history = signal<AuditLog[]>([]);
  protected readonly historyLimit = signal(20);
  protected readonly historyLoading = signal(false);
  protected readonly hasMoreHistory = signal(false);

  protected readonly newVarKey = model('');
  protected readonly newVarValue = model('');
  protected readonly newVarDescription = model('');
  protected readonly newVarIsSecret = model(false);
  protected readonly newVarIsRequired = model(false);

  protected readonly showSecretValues = signal<ReadonlySet<string>>(new Set<string>());

  protected readonly filteredVariables = computed(() => {
    const q = this.keyFilter().trim().toLowerCase();
    const vars = this.variables();
    if (!q) {
      return vars;
    }
    return vars.filter(
      (v) =>
        v.key.toLowerCase().includes(q) || (v.description && v.description.toLowerCase().includes(q)),
    );
  });

  protected readonly diffSummary = computed(() => {
    const r = this.diffResults();
    let a = 0;
    let m = 0;
    let d = 0;
    for (const e of r) {
      if (e.status === 'added') {
        a += 1;
      } else if (e.status === 'modified') {
        m += 1;
      } else if (e.status === 'removed') {
        d += 1;
      }
    }
    return { added: a, modified: m, removed: d, total: r.length };
  });

  protected readonly visibleDiffRows = computed(() => {
    const rows = this.diffResults();
    if (this.hideUnchanged()) {
      return rows.filter((e) => e.status !== 'unchanged');
    }
    return rows;
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadProject(slug);
    }
  }

  protected loadProject(slug: string): void {
    this.loading.set(true);
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        const project = projects.find((p) => p.slug === slug);
        if (!project) {
          this.error.set('Project not found');
          this.loading.set(false);
          this.toasts.show('Project not found', 'error');
          return;
        }
        this.project.set(project);
        const envs = project.envs ?? [];
        this.environments.set(envs);
        if (envs.length > 0) {
          this.activeEnv.set(envs[0].name);
          this.loadVariables();
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load project');
        this.toasts.show('Failed to load project', 'error');
      },
    });
  }

  protected loadVariables(): void {
    const project = this.project();
    const activeEnv = this.activeEnv();
    if (!project || !activeEnv) {
      return;
    }

    this.loading.set(true);
    this.projectService.getVariables(project.id, activeEnv).subscribe({
      next: (vars) => {
        this.variables.set(vars);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load variables');
        this.toasts.show('Failed to load variables', 'error');
      },
    });
  }

  protected selectEnv(envName: string): void {
    this.activeEnv.set(envName);
    this.loadVariables();
    this.history.set([]);
  }

  protected setTab(t: EditorTab): void {
    this.activeTab.set(t);
    if (t !== 'variables') {
      this.addingVar.set(false);
    }
  }

  protected toggleAddVar(): void {
    this.addingVar.update((a) => !a);
  }

  protected toggleSecret(id: string): void {
    this.showSecretValues.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  protected saveNewVariable(): void {
    const project = this.project();
    const activeEnv = this.activeEnv();
    const key = this.newVarKey().trim();
    if (!project || !activeEnv || !key) {
      this.toasts.show('Key is required', 'error');
      return;
    }

    const varDto: VariableDto = {
      key,
      value: this.newVarValue() || null,
      isSecret: this.newVarIsSecret(),
      isRequired: this.newVarIsRequired(),
      description: this.newVarDescription() || undefined,
    };

    const updatedVars: VariableDto[] = [
      ...this.variables().map((v) => ({
        key: v.key,
        value: v.isSecret ? undefined : v.value || undefined,
        isSecret: v.isSecret,
        isRequired: v.isRequired,
        description: v.description,
      })),
      varDto,
    ];

    this.projectService.updateVariables(project.id, activeEnv, updatedVars).subscribe({
      next: () => {
        this.addingVar.set(false);
        this.newVarKey.set('');
        this.newVarValue.set('');
        this.newVarDescription.set('');
        this.newVarIsSecret.set(false);
        this.newVarIsRequired.set(false);
        this.loadVariables();
        this.toasts.show('Variable added', 'success');
      },
      error: (err) => {
        this.toasts.show(err.error?.message || 'Failed to add variable', 'error');
      },
    });
  }

  protected deleteVariable(variable: Variable): void {
    const project = this.project();
    const activeEnv = this.activeEnv();
    if (!project || !activeEnv) {
      return;
    }

    const updatedVars: VariableDto[] = this.variables()
      .filter((v) => v.key !== variable.key)
      .map((v) => ({
        key: v.key,
        value: v.isSecret ? undefined : v.value || undefined,
        isSecret: v.isSecret,
        isRequired: v.isRequired,
        description: v.description,
      }));

    this.projectService.updateVariables(project.id, activeEnv, updatedVars).subscribe({
      next: () => {
        this.loadVariables();
        this.toasts.show('Variable removed', 'info');
      },
      error: (err) => {
        this.toasts.show(err.error?.message || 'Failed to delete variable', 'error');
      },
    });
  }

  protected updateVariableValue(variable: Variable, newValue: string): void {
    const project = this.project();
    const activeEnv = this.activeEnv();
    if (!project || !activeEnv) {
      return;
    }

    const updatedVars: VariableDto[] = this.variables().map((v) => ({
      key: v.key,
      value: v.key === variable.key ? newValue : v.isSecret ? undefined : v.value || undefined,
      isSecret: v.isSecret,
      isRequired: v.isRequired,
      description: v.description,
    }));

    this.projectService.updateVariables(project.id, activeEnv, updatedVars).subscribe({
      next: () => {
        this.loadVariables();
      },
      error: (err) => {
        this.toasts.show(err.error?.message || 'Failed to update variable', 'error');
      },
    });
  }

  protected runDiff(): void {
    const project = this.project();
    const env1 = this.diffEnv1();
    const env2 = this.diffEnv2();
    if (!project || !env1 || !env2) {
      this.toasts.show('Select two environments', 'error');
      return;
    }

    this.diffLoading.set(true);
    this.projectService.diffEnvironments(project.id, env1, env2).subscribe({
      next: (results) => {
        this.diffResults.set(results);
        this.diffLoading.set(false);
      },
      error: (err) => {
        this.diffLoading.set(false);
        this.toasts.show(err.error?.message || 'Failed to compare', 'error');
      },
    });
  }

  protected loadHistory(append: boolean = false): void {
    const project = this.project();
    const activeEnv = this.activeEnv();
    if (!project || !activeEnv) {
      return;
    }

    if (!append) {
      this.historyLimit.set(20);
    } else {
      this.historyLimit.update((l) => l + 20);
    }
    this.historyLoading.set(true);
    const limit = this.historyLimit();
    this.projectService.getHistory(project.id, activeEnv, limit).subscribe({
      next: (logs) => {
        this.history.set(logs);
        this.hasMoreHistory.set(logs.length > 0 && logs.length === limit);
        this.historyLoading.set(false);
      },
      error: (err) => {
        this.historyLoading.set(false);
        this.toasts.show(err.error?.message || 'Failed to load history', 'error');
      },
    });
  }

  protected addEnvironment(): void {
    const project = this.project();
    const name = this.newEnvName().trim();
    if (!project || !name) {
      this.toasts.show('Environment name is required', 'error');
      return;
    }

    this.projectService.createEnvironment(project.id, { name }).subscribe({
      next: (env) => {
        this.environments.update((envs) => [...envs, env]);
        this.showAddEnv.set(false);
        this.newEnvName.set('');
        this.toasts.show('Environment created', 'success');
      },
      error: (err) => {
        this.toasts.show(err.error?.message || 'Failed to create environment', 'error');
      },
    });
  }

  protected openDeleteEnv(name: string): void {
    this.envNameToDelete.set(name);
    this.showDeleteEnvModal.set(true);
  }

  protected confirmDeleteEnv(): void {
    const project = this.project();
    const name = this.envNameToDelete();
    if (!project || !name) {
      return;
    }
    this.projectService.deleteEnvironment(project.id, name).subscribe({
      next: () => {
        this.showDeleteEnvModal.set(false);
        this.envNameToDelete.set(null);
        this.environments.update((e) => e.filter((x) => x.name !== name));
        const remaining = this.environments();
        if (this.activeEnv() === name) {
          this.activeEnv.set(remaining[0]?.name ?? null);
          if (remaining[0]) {
            this.loadVariables();
          } else {
            this.variables.set([]);
            this.loading.set(false);
          }
        }
        this.toasts.show('Environment deleted', 'info');
        if (remaining.length === 0) {
          void this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.toasts.show(err.error?.message || 'Failed to delete environment', 'error');
      },
    });
  }

  protected getDisplayValue(variable: Variable): string {
    if (!variable.isSecret) {
      return variable.value || '';
    }
    return this.showSecretValues().has(variable.id) ? variable.value || '[encrypted]' : '••••••••';
  }

  protected rowClass(status: string): string {
    switch (status) {
      case 'added':
        return 'bg-emerald-500/5';
      case 'removed':
        return 'bg-rose-500/5';
      case 'modified':
        return 'bg-amber-500/5';
      default:
        return '';
    }
  }

  protected statusTextClass(status: string): string {
    switch (status) {
      case 'added':
        return 'text-success';
      case 'removed':
        return 'text-danger';
      case 'modified':
        return 'text-warn';
      default:
        return 'text-fg-muted';
    }
  }

  protected async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.toasts.show('Copied', 'success');
    } catch {
      this.toasts.show('Copy failed', 'error');
    }
  }

  protected logActionClass(action: string): string {
    if (action === 'CREATE') {
      return 'text-success';
    }
    if (action === 'UPDATE') {
      return 'text-warn';
    }
    if (action === 'DELETE') {
      return 'text-danger';
    }
    return 'text-fg-muted';
  }
}
