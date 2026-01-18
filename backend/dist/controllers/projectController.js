import prisma from '../config/database.js';
export const getProjects = async (req, res) => {
    try {
        const { organizationId } = req.query;
        // Build where clause
        const where = { deletedAt: null };
        if (organizationId) {
            where.organizationId = String(organizationId);
        }
        const projects = await prisma.project.findMany({
            where,
            include: {
                tasks: {
                    include: {
                        task: true
                    }
                }
            }
        });
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};
export const createProject = async (req, res) => {
    try {
        const { name, orgId } = req.body; // Frontend sends 'orgId'
        const project = await prisma.project.create({
            data: {
                name,
                organizationId: orgId
            }
        });
        res.status(201).json(project);
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            error: 'Failed to create project',
            details: error.message
        });
    }
};
export const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findFirst({
            where: {
                id,
                deletedAt: null
            },
            include: {
                tasks: {
                    include: {
                        task: {
                            include: {
                                assignee: true,
                                collaborators: true
                            }
                        }
                    },
                    orderBy: {
                        position: 'asc'
                    }
                }
            }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
};
export const getProjectTasks = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const { status, assigneeId, priority, q } = req.query;
        const where = {
            projectId: String(id),
            task: {
                deletedAt: null
            }
        };
        if (status)
            where.task.status = String(status);
        if (priority)
            where.task.priority = String(priority);
        if (assigneeId)
            where.task.assigneeId = String(assigneeId);
        if (q) {
            where.task.title = { contains: String(q), mode: 'insensitive' };
        }
        const projectTasks = await prisma.projectTask.findMany({
            where,
            include: {
                task: {
                    include: {
                        assignee: true,
                        collaborators: { include: { user: true } },
                        projects: { include: { project: true } }
                    }
                }
            },
            orderBy: { position: 'asc' }
        });
        // Map back to Task[]
        const tasks = projectTasks.map(pt => pt.task);
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch project tasks' });
    }
};
export const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const project = await prisma.project.update({
            where: { id },
            data: { name }
        });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
};
export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete
        await prisma.project.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
};
