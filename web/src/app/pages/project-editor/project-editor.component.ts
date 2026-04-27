/**
 * Project editor page
 * @module web/app/pages/project-editor/project-editor.component
 * @description View/edit project environments and variables, plus diff and history tools.
 */
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { AuditLog, DiffEntry, Environment, Project, Variable, VariableDto } from '../../models';

@Component({
  selector: 'app-project-editor',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './project-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);

  protected readonly project = signal<Project | null>(null);
  protected readonly environments = signal<Environment[]>([]);
  protected readonly activeEnv = signal<string | null>(null);
  protected readonly variables = signal<Variable[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly showAddVar = signal(false);
  protected readonly showDiff = signal(false);
  protected readonly showHistory = signal(false);
  protected readonly showAddEnv = signal(false);

  protected readonly diffEnv1 = signal('');
  protected readonly diffEnv2 = signal('');
  protected readonly diffResults = signal<DiffEntry[]>([]);
  protected readonly history = signal<AuditLog[]>([]);

  protected readonly newVarKey = signal('');
  protected readonly newVarValue = signal('');
  protected readonly newVarDescription = signal('');
  protected readonly newVarIsSecret = signal(false);
  protected readonly newVarIsRequired = signal(false);
  protected readonly newEnvName = signal('');

  protected readonly showSecretValues = signal<ReadonlySet<string>>(new Set<string>());

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadProject(slug);
    }
  }

  /**
   * Load project by slug from the project list and initialize the active environment.
   */
  protected loadProject(slug: string): void {
    this.loading.set(true);
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        const project = projects.find((p) => p.slug === slug);
        if (!project) {
          this.error.set('Project not found');
          this.loading.set(false);
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
      },
    });
  }

  /**
   * Load variables for the currently selected environment.
   */
  protected loadVariables(): void {
    const project = this.project();
    const activeEnv = this.activeEnv();
    if (!project || !activeEnv) return;

    this.loading.set(true);
    this.projectService.getVariables(project.id, activeEnv).subscribe({
      next: (vars) => {
        this.variables.set(vars);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load variables');
      },
    });
  }

  /**
   * Switch active environment in the UI.
   */
  protected selectEnv(envName: string): void {
    this.activeEnv.set(envName);
    this.loadVariables();
  }

  /**
   * Toggle whether a secret variable value should be shown in the UI.
   */
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

  /**
   * Toggle one of the side panels (diff/history/add var) ensuring the others stay closed.
   */
  protected togglePanel(panel: 'diff' | 'history' | 'addVar'): void {
    if (panel === 'diff') {
      this.showDiff.update((v) => !v);
      this.showHistory.set(false);
      this.showAddVar.set(false);
    } else if (panel === 'history') {
      this.showHistory.update((v) => !v);
      this.showDiff.set(false);
      this.showAddVar.set(false);
    } else {
      this.showAddVar.set(true);
      this.showDiff.set(false);
      this.showHistory.set(false);
    }
  }

  /**
   * Add a new variable by submitting a full variables upsert payload.
   */
  protected saveVariables(): void {
    const project = this.project();
    const activeEnv = this.activeEnv();
    const key = this.newVarKey().trim();
    if (!project || !activeEnv || !key) return;

    const varDto: VariableDto = {
      key,
      value: this.newVarValue(),
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
        this.showAddVar.set(false);
        this.resetNewVar();
        this.loadVariables();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to add variable');
      },
    });
  }

  /**
   * Delete a variable by sending an updated variable list (full replace semantics).
   */
  protected deleteVariable(variable: Variable): void {
    const project = this.project();
    const activeEnv = this.activeEnv();
    if (!project || !activeEnv) return;

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
      next: () => this.loadVariables(),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to delete variable');
      },
    });
  }

  /**
   * Persist an edited variable value by resending the updated variable list.
   */
  protected updateVariableValue(variable: Variable, newValue: string): void {
    const project = this.project();
    const activeEnv = this.activeEnv();
    if (!project || !activeEnv) return;

    const updatedVars: VariableDto[] = this.variables().map((v) => ({
      key: v.key,
      value: v.key === variable.key ? newValue : v.isSecret ? undefined : v.value || undefined,
      isSecret: v.isSecret,
      isRequired: v.isRequired,
      description: v.description,
    }));

    this.projectService.updateVariables(project.id, activeEnv, updatedVars).subscribe({
      next: () => this.loadVariables(),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update variable');
      },
    });
  }

  /**
   * Run an environment diff using the selected diff envs.
   */
  protected runDiff(): void {
    const project = this.project();
    const env1 = this.diffEnv1();
    const env2 = this.diffEnv2();
    if (!project || !env1 || !env2) return;

    this.projectService.diffEnvironments(project.id, env1, env2).subscribe({
      next: (results) => {
        this.diffResults.set(results);
        this.showDiff.set(true);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to diff environments');
      },
    });
  }

  /**
   * Load environment audit history.
   */
  protected loadHistory(): void {
    const project = this.project();
    const activeEnv = this.activeEnv();
    if (!project || !activeEnv) return;

    this.projectService.getHistory(project.id, activeEnv).subscribe({
      next: (logs) => {
        this.history.set(logs);
        this.showHistory.set(true);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load history');
      },
    });
  }

  /**
   * Create a new environment for this project.
   */
  protected addEnvironment(): void {
    const project = this.project();
    const name = this.newEnvName().trim();
    if (!project || !name) return;

    this.projectService.createEnvironment(project.id, { name }).subscribe({
      next: (env) => {
        this.environments.update((envs) => [...envs, env]);
        this.showAddEnv.set(false);
        this.newEnvName.set('');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to create environment');
      },
    });
  }

  /**
   * Determine which value to show for a variable (masked for secrets by default).
   */
  protected getDisplayValue(variable: Variable): string {
    if (!variable.isSecret) {
      return variable.value || '';
    }
    return this.showSecretValues().has(variable.id) ? variable.value || '[encrypted]' : '••••••••';
  }

  /**
   * Map a diff status to a Tailwind text color class.
   */
  protected getStatusColor(status: string): string {
    switch (status) {
      case 'added':
        return 'text-green-600';
      case 'removed':
        return 'text-red-600';
      case 'modified':
        return 'text-yellow-600';
      default:
        return 'text-gray-400';
    }
  }

  private resetNewVar(): void {
    this.newVarKey.set('');
    this.newVarValue.set('');
    this.newVarDescription.set('');
    this.newVarIsSecret.set(false);
    this.newVarIsRequired.set(false);
  }
}
