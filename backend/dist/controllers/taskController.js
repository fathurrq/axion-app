import prisma from '../config/database.js';
export const createTask = async (req, res) => {
    try {
        const { title, description, organizationId, assigneeId, createdBy, priority, dueDate, projectId // Optional: if created directly within a project
         } = req.body;
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the task itself
            const task = await tx.task.create({
                data: {
                    title,
                    description,
                    organizationId,
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
            // 3. Create activity log
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
        console.error(error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, assigneeId, dueDate, userId } = req.body; // userId is the actor
        const existingTask = await prisma.task.findUnique({ where: { id } });
        if (!existingTask)
            return res.status(404).json({ error: 'Task not found' });
        const updatedTask = await prisma.task.update({
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
        // Log the change
        if (userId) {
            await prisma.activityLog.create({
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
        res.json(updatedTask);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
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
