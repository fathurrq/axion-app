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
        const { name, organizationId } = req.body;
        const project = await prisma.project.create({
            data: {
                name,
                organizationId
            }
        });
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
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
