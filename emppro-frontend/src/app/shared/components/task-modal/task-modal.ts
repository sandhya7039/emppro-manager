import { Component, signal, input, output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-task-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-modal.html',
  styleUrl: './task-modal.scss'
})
export class TaskModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);

  // Inputs - using signals
  isOpen = input<boolean>(false);
  mode = input<'create' | 'edit'>('create');
  taskData = input<any>(null);

  // Outputs
  close = output<void>();
  save = output<any>();

  // Form
  taskForm!: FormGroup;
  projects = signal<Project[]>([]);
  isLoading = signal<boolean>(false);

  priorityOptions = [
    { value: 'low', label: 'Low', icon: '🟢' },
    { value: 'medium', label: 'Medium', icon: '🟡' },
    { value: 'high', label: 'High', icon: '🔴' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadProjects();
  }

  initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      project_id: ['', [Validators.required]],
      priority: ['medium', [Validators.required]],
      due_date: ['', [Validators.required]]
    });

    // If edit mode and taskData provided, patch values
    if (this.mode() === 'edit' && this.taskData()) {
      this.taskForm.patchValue(this.taskData());
    }
  }

  loadProjects(): void {
    this.projectService.getMyProjects().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.projects.set(response.data || []);
        }
      },
      error: (error) => console.error('Error loading projects:', error)
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formData = this.taskForm.value;
    this.save.emit(formData);
    this.isLoading.set(false);
  }

  onClose(): void {
    this.taskForm.reset({ priority: 'medium' });
    this.close.emit();
  }

  get f() {
    return this.taskForm.controls;
  }
}