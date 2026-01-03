import prisma from '../config/database.js';
export const getOrganizations = async (req, res) => {
    try {
        const organizations = await prisma.organization.findMany({
            where: { deletedAt: null }
        });
        res.json(organizations);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch organizations' });
    }
};
export const createOrganization = async (req, res) => {
    try {
        const { name, ownerId } = req.body;
        // Transaction to create org and add owner member
        const result = await prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: { name }
            });
            await tx.organizationMember.create({
                data: {
                    organizationId: org.id,
                    userId: ownerId,
                    role: 'owner'
                }
            });
            return org;
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create organization' });
    }
};
export const getOrganizationById = async (req, res) => {
    try {
        const { id } = req.params;
        const organization = await prisma.organization.findFirst({
            where: {
                id,
                deletedAt: null
            },
            include: {
                projects: {
                    where: { deletedAt: null }
                },
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        res.json(organization);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch organization' });
    }
};
