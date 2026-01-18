// Core Types for Axion Task Management

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  auth0Id?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface OrganizationMember {
  organizationId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: string;
  organization?: Organization;
  user?: User;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  createdAt: string;
  deletedAt: string | null;
  taskCount?: number;
}

export type TaskStatus = 'to_do' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  organizationId: string;
  assigneeId: string | null;
  createdBy: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  assignee?: User | null;
  creator?: User;
  collaborators?: TaskCollaborator[];
  projects?: ProjectTask[];
  comments?: Comment[];
}

export interface ProjectTask {
  projectId: string;
  taskId: string;
  position: number;
  project?: Project;
  task?: Task;
}

export interface TaskCollaborator {
  taskId: string;
  userId: string;
  user?: User;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// API Request/Response Types
export interface ApiResponse<T> {
  data: T;
  error: string | null;
}

export interface CreateOrgRequest {
  name: string;
  ownerId: string;
}

export interface JoinOrgRequest {
  inviteCode: string;
  userId: string;
}

export interface CreateProjectRequest {
  orgId: string;
  name: string;
}

export interface UpdateProjectRequest {
  name: string;
}

export interface CreateTaskRequest {
  orgId: string;
  projectId: string;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  collaboratorIds?: string[];
  createdBy: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  collaboratorIds?: string[];
  userId: string; // Actor
}

export interface CreateCommentRequest {
  body: string;
  userId: string;
}

export interface TaskFilters {
  status?: TaskStatus | 'all';
  assigneeId?: string | 'anyone' | 'me';
  priority?: TaskPriority | 'all';
  q?: string;
}

// UI State Types
export interface AppState {
  activeOrgId: string | null;
  user: User | null;
  organizations: Organization[];
}
