import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { Project, Environment, Variable, VariableDto, DiffEntry, AuditLog } from '../../models';

@Component({
  selector: 'app-project-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './project-editor.component.html',
})
export class ProjectEditorComponent implements OnInit {
  project: Project | null = null;
  environments: Environment[] = [];
  activeEnv: string | null = null;
  variables: Variable[] = [];
  loading = true;
  error = '';
  showAddVar = false;
  showDiff = false;
  showHistory = false;
  diffEnv1 = '';
  diffEnv2 = '';
  diffResults: DiffEntry[] = [];
  history: AuditLog[] = [];
  newVar: Partial<VariableDto> = {
    key: '',
    value: '',
    isSecret: false,
    isRequired: false,
    description: '',
  };
  showSecretValues = new Set<string>();
  newEnvName = '';
  showAddEnv = false;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadProject(slug);
    }
  }

  loadProject(slug: string) {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        const project = projects.find((p) => p.slug === slug);
        if (!project) {
          this.error = 'Project not found';
          this.loading = false;
          return;
        }
        this.project = project;
        this.environments = project.envs || [];
        if (this.environments.length > 0) {
          this.activeEnv = this.environments[0].name;
          this.loadVariables();
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load project';
      },
    });
  }

  loadVariables() {
    if (!this.project || !this.activeEnv) return;

    this.loading = true;
    this.projectService.getVariables(this.project.id, this.activeEnv).subscribe({
      next: (vars) => {
        this.variables = vars;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load variables';
      },
    });
  }

  selectEnv(envName: string) {
    this.activeEnv = envName;
    this.loadVariables();
  }

  toggleSecret(id: string) {
    if (this.showSecretValues.has(id)) {
      this.showSecretValues.delete(id);
    } else {
      this.showSecretValues.add(id);
    }
  }

  saveVariables() {
    if (!this.project || !this.activeEnv || !this.newVar.key) return;

    const varDto: VariableDto = {
      key: this.newVar.key.trim(),
      value: this.newVar.value,
      isSecret: this.newVar.isSecret || false,
      isRequired: this.newVar.isRequired || false,
      description: this.newVar.description,
    };

    const updatedVars = [
      ...this.variables.map((v) => ({
        key: v.key,
        value: v.isSecret ? undefined : v.value || undefined,
        isSecret: v.isSecret,
        isRequired: v.isRequired,
        description: v.description,
      })),
      varDto,
    ];

    this.projectService.updateVariables(this.project.id, this.activeEnv, updatedVars).subscribe({
      next: () => {
        this.showAddVar = false;
        this.newVar = { key: '', value: '', isSecret: false, isRequired: false, description: '' };
        this.loadVariables();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to add variable';
      },
    });
  }

  deleteVariable(variable: Variable) {
    if (!this.project || !this.activeEnv) return;

    const updatedVars = this.variables
      .filter((v) => v.key !== variable.key)
      .map((v) => ({
        key: v.key,
        value: v.isSecret ? undefined : v.value || undefined,
        isSecret: v.isSecret,
        isRequired: v.isRequired,
        description: v.description,
      }));

    this.projectService.updateVariables(this.project.id, this.activeEnv, updatedVars).subscribe({
      next: () => this.loadVariables(),
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete variable';
      },
    });
  }

  updateVariableValue(variable: Variable) {
    if (!this.project || !this.activeEnv) return;

    const updatedVars = this.variables.map((v) => ({
      key: v.key,
      value: v.key === variable.key ? v.value : v.isSecret ? undefined : v.value || undefined,
      isSecret: v.isSecret,
      isRequired: v.isRequired,
      description: v.description,
    }));

    this.projectService.updateVariables(this.project.id, this.activeEnv, updatedVars).subscribe({
      next: () => {},
      error: (err) => {
        this.error = err.error?.message || 'Failed to update variable';
      },
    });
  }

  runDiff() {
    if (!this.project || !this.diffEnv1 || !this.diffEnv2) return;

    this.projectService.diffEnvironments(this.project.id, this.diffEnv1, this.diffEnv2).subscribe({
      next: (results) => {
        this.diffResults = results;
        this.showDiff = true;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to diff environments';
      },
    });
  }

  loadHistory() {
    if (!this.project || !this.activeEnv) return;

    this.projectService.getHistory(this.project.id, this.activeEnv).subscribe({
      next: (logs) => {
        this.history = logs;
        this.showHistory = true;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load history';
      },
    });
  }

  addEnvironment() {
    if (!this.project || !this.newEnvName.trim()) return;

    this.projectService
      .createEnvironment(this.project.id, { name: this.newEnvName.trim() })
      .subscribe({
        next: (env) => {
          this.environments.push(env);
          this.showAddEnv = false;
          this.newEnvName = '';
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to create environment';
        },
      });
  }

  getDisplayValue(variable: Variable): string {
    if (!variable.isSecret) {
      return variable.value || '';
    }
    return this.showSecretValues.has(variable.id) ? variable.value || '[encrypted]' : '••••••••';
  }

  getStatusColor(status: string): string {
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
}
