import prisma from '../config/database.js';
export const createTask = async (req, res) => {
    try {
        const { title, description, orgId, // Frontend sends orgId
        organizationId, // Fallback
        assigneeId, createdBy, priority, dueDate, projectId, collaboratorIds = [] } = req.body;
        const finalOrgId = organizationId || orgId;
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the task itself
            const task = await tx.task.create({
                data: {
                    title,
                    description,
                    organizationId: finalOrgId,
                    assigneeId,
                    createdBy,
                    priority,
                    dueDate: dueDate ? new Date(dueDate) : null
                }
            });
            // 2. If a project context is provided, link it immediately
            if (projectId) {
                // Get max position to append to end of list
                const maxPos = await tx.projectTask.aggregate({
                    where: { projectId },
                    _max: { position: true }
                });
                const newPos = (maxPos._max.position || 0) + 65535; // Gap for reordering
                await tx.projectTask.create({
                    data: {
                        projectId,
                        taskId: task.id,
                        position: newPos
                    }
                });
            }
            // 3. Add collaborators
            if (collaboratorIds && collaboratorIds.length > 0) {
                await tx.taskCollaborator.createMany({
                    data: collaboratorIds.map((userId) => ({
                        taskId: task.id,
                        userId
                    }))
                });
            }
            // 4. Create activity log
            await tx.activityLog.create({
                data: {
                    entityType: 'task',
                    entityId: task.id,
                    userId: createdBy,
                    action: 'create_task',
                    metadata: { title }
                }
            });
            return task;
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            error: 'Failed to create task',
            details: error.message
        });
    }
};
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, assigneeId, dueDate, userId, collaboratorIds } = req.body;
        const existingTask = await prisma.task.findUnique({ where: { id } });
        if (!existingTask)
            return res.status(404).json({ error: 'Task not found' });
        const result = await prisma.$transaction(async (tx) => {
            const updatedTask = await tx.task.update({
                where: { id },
                data: {
                    title,
                    description,
                    status,
                    priority,
                    assigneeId,
                    dueDate: dueDate ? new Date(dueDate) : (dueDate === null ? null : undefined)
                }
            });
            // Update collaborators if provided
            if (collaboratorIds !== undefined) {
                // Delete existing
                await tx.taskCollaborator.deleteMany({ where: { taskId: id } });
                // Insert new
                if (collaboratorIds.length > 0) {
                    await tx.taskCollaborator.createMany({
                        data: collaboratorIds.map((uid) => ({
                            taskId: id,
                            userId: uid
                        }))
                    });
                }
            }
            // Log the change
            if (userId) {
                await tx.activityLog.create({
                    data: {
                        entityType: 'task',
                        entityId: id,
                        userId,
                        action: 'update_task',
                        metadata: {
                            old: existingTask,
                            new: updatedTask
                        }
                    }
                });
            }
            return updatedTask;
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task', details: error.message });
    }
};
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete
        await prisma.task.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
};
export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                projects: {
                    include: { project: true }
                },
                assignee: true,
                collaborators: {
                    include: { user: true }
                }
            }
        });
        if (!task)
            return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch task' });
    }
};
export const getMyTasks = async (req, res) => {
    try {
        const { orgId, userId } = req.query;
        if (!orgId || !userId) {
            return res.status(400).json({ error: 'orgId and userId are required' });
        }
        const tasks = await prisma.task.findMany({
            where: {
                organizationId: String(orgId),
                assigneeId: String(userId),
                deletedAt: null
            },
            include: {
                projects: { include: { project: true } },
                assignee: true,
                collaborators: { include: { user: true } }
            },
            orderBy: { createdAt: 'desc' } // Simplified sort for now
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch my tasks' });
    }
};
