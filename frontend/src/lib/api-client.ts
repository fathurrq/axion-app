import type {
  ApiResponse,
  Organization,
  CreateOrgRequest,
  JoinOrgRequest,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  Comment,
  CreateCommentRequest,
  TaskFilters,
  User,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        return { data: null as T, error: error.error || 'Request failed' };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        data: null as T,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Organizations
  async getOrganizations(userId?: string): Promise<ApiResponse<Organization[]>> {
    const query = userId ? `?userId=${userId}` : '';
    return this.request<Organization[]>(`/api/organizations${query}`);
  }

  async createOrganization(data: CreateOrgRequest): Promise<ApiResponse<Organization>> {
    return this.request<Organization>('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinOrganization(data: JoinOrgRequest): Promise<ApiResponse<Organization>> {
    return this.request<Organization>('/api/organizations/join', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Projects
  async getProjects(orgId: string): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>(`/api/projects?orgId=${orgId}`);
  }

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/projects/${projectId}`);
  }

  async createProject(data: CreateProjectRequest): Promise<ApiResponse<Project>> {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(
    projectId: string,
    data: UpdateProjectRequest
  ): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Tasks
  async getMyTasks(orgId: string, userId: string): Promise<ApiResponse<Task[]>> {
    return this.request<Task[]>(`/api/tasks/my?orgId=${orgId}&userId=${userId}`);
  }

  async getProjectTasks(
    projectId: string,
    filters?: TaskFilters
  ): Promise<ApiResponse<Task[]>> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.assigneeId && filters.assigneeId !== 'anyone')
      params.append('assigneeId', filters.assigneeId);
    if (filters?.priority && filters.priority !== 'all')
      params.append('priority', filters.priority);
    if (filters?.q) params.append('q', filters.q);

    const queryString = params.toString();
    const url = `/api/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`;

    return this.request<Task[]>(url);
  }

  async getTask(taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/api/tasks/${taskId}`);
  }

  async createTask(data: CreateTaskRequest): Promise<ApiResponse<Task>> {
    return this.request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(taskId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Comments
  async getTaskComments(taskId: string): Promise<ApiResponse<Comment[]>> {
    return this.request<Comment[]>(`/api/comments/task/${taskId}`);
  }

  async createComment(
    taskId: string,
    data: CreateCommentRequest
  ): Promise<ApiResponse<Comment>> {
    return this.request<Comment>('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ ...data, taskId }), 
    });
  }

  // Users (for assignee/collaborator selection)
  async getOrgMembers(orgId: string): Promise<ApiResponse<User[]>> {
    return this.request<User[]>(`/api/organizations/${orgId}/members`);
  }
}

export const apiClient = new ApiClient();
