# Database Schema Design (Phase 2: Scalable & Professional)

This schema is designed to prevent technical debt. It decouples Identity from Organization and allows flexible task management.

## Key Architectural Changes
1.  **Identity vs. Membership**: Users are global. Use `organization_members` to link them to Orgs.
2.  **Multi-homing**: Tasks live in `project_tasks`, not just a single project column.
3.  **Data Safety**: All tables use `deleted_at` for soft deletes.

---

## Tables

### 1. Users (Global Identity)
*   `id`: UUID (PK)
*   `email`: VARCHAR (Unique)
*   `full_name`: VARCHAR
*   `created_at`: TIMESTAMP

### 2. Organizations (Tenants)
*   `id`: UUID (PK)
*   `name`: VARCHAR
*   `created_at`: TIMESTAMP
*   `deleted_at`: TIMESTAMP (Soft Delete)

### 3. Organization_Members (The Link)
*   `organization_id`: UUID (FK)
*   `user_id`: UUID (FK)
*   `role`: VARCHAR (e.g., 'owner', 'member')
*   *PK*: (organization_id, user_id)

### 4. Projects
*   `id`: UUID (PK)
*   `organization_id`: UUID (FK)
*   `name`: VARCHAR
*   `created_at`: TIMESTAMP
*   `deleted_at`: TIMESTAMP

### 5. Tasks (The Core)
*   `id`: UUID (PK)
*   `organization_id`: UUID (FK) -- *Crucial optimization: Tasks belong to Org, linked to Projects.*
*   `assignee_id`: UUID (FK -> Users)
*   `created_by`: UUID (FK -> Users)
*   `title`: VARCHAR
*   `description`: TEXT
*   `status`: VARCHAR
*   `priority`: VARCHAR
*   `created_at`: TIMESTAMP
*   `deleted_at`: TIMESTAMP

### 6. Project_Tasks (Multi-homing)
Allows one task to show up in multiple projects (e.g. "Sprint Board" and "Feature Roadmap").
*   `project_id`: UUID (FK)
*   `task_id`: UUID (FK)
*   `position`: INTEGER (For custom sorting in board/list views)
*   *PK*: (project_id, task_id)

### 7. Task_Collaborators
*   `task_id`: UUID (FK)
*   `user_id`: UUID (FK)
*   *PK*: (task_id, user_id)

### 8. Activity_Logs (Audit Trail)
*   `id`: UUID (PK)
*   `entity_type`: VARCHAR (e.g., 'task', 'project')
*   `entity_id`: UUID
*   `user_id`: UUID (Actor)
*   `action`: VARCHAR (e.g., 'status_change', 'comment')
*   `metadata`: JSONB (Stores "old_value" -> "new_value")
*   `created_at`: TIMESTAMP

---

## SQL Representation (Postgres)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE organization_members (
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL, -- Ownership root
  assignee_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'to_do',
  priority VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Enables Many-to-Many (One task in multiple projects)
CREATE TABLE project_tasks (
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- Cascade on HARD delete only
  position FLOAT DEFAULT 0, -- Kanban sorting
  PRIMARY KEY (project_id, task_id)
);

CREATE TABLE task_collaborators (
  task_id UUID REFERENCES tasks(id),
  user_id UUID REFERENCES users(id),
  PRIMARY KEY (task_id, user_id)
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  metadata JSONB, -- Flexible storage for changes
  created_at TIMESTAMP DEFAULT NOW()
);
```
