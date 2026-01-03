# Phase 1: Core Features (MVP)

For the initial phase, the goal is to build a functional foundation that allows users to manage tasks effectively without the complexity of advanced automation or reporting.

## 1. Authentication & User Management
*   **Sign Up / Login**: Secure email and password authentication.
*   **User Profile**: Basic profile with name and avatar.

## 2. Organization & Structure
*   **Organization**: The top-level entity.
    *   A User belongs to an **Organization**.
    *   An Organization contains multiple **Projects**.
*   **Projects**: Containers for tasks, belonging to an Organization.

## 3. Core Task Management (The "Must-Haves")
*   **CRUD Operations**: Create, Read, Update, Delete tasks.
*   **Task Details**:
    *   **Title**: Short description of the task.
    *   **Description**: Rich text or simple text area for details.
    *   **Status**: Simple status dropdown (e.g., To Do, In Progress, Done).
    *   **Priority**: Low, Medium, High.
    *   **Due Date**: Single date picker.
    *   **Assignee**: **Single** user responsible for the task.
    *   **Collaborators**: **Multiple** users who are watching or contributing to the task.

## 4. Views (Visualization)
*   **List View**: A simple vertical list of tasks, grouped by status.

## 5. Basic Collaboration
*   **Comments**: Simple text comments on tasks to discuss work.
s
## 6. Technical Foundation (Hidden Features)
*   **Responsive Layout**: ensure the sidebar and main content area work on desktop.
*   **Data Structure**: 
    *   `Organization` (1) <-> (N) `Project`
    *   `Project` (1) <-> (N) `Task`
    *   `Task` (1) <-> (1) `Assignee` (User)
    *   `Task` (1) <-> (N) `Collaborators` (Users)

---

### What we are SKIPPING in Phase 1:
*   *Subtasks* (complex nesting logic)
*   *Timeline/Gantt Views* (complex rendering)
*   *Dependencies*
*   *Automations/Rules*
*   *File Attachments* (adds storage complexity)
*   *Dashboards/Reporting*
