import prisma from '../config/database.js';
export const getOrganizations = async (req, res) => {
    try {
        const { userId } = req.query; // Optional filter by user
        const where = { deletedAt: null };
        if (userId) {
            where.members = {
                some: {
                    userId: String(userId)
                }
            };
        }
        const organizations = await prisma.organization.findMany({
            where
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
            if (ownerId) {
                await tx.organizationMember.create({
                    data: {
                        organizationId: org.id,
                        userId: ownerId,
                        role: 'owner'
                    }
                });
            }
            return org;
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create organization' });
    }
};
export const joinOrganization = async (req, res) => {
    try {
        const { inviteCode, userId } = req.body;
        // MVP: inviteCode is treated as Organization ID
        const org = await prisma.organization.findUnique({
            where: { id: inviteCode }
        });
        if (!org) {
            return res.status(404).json({ error: 'Organization not found (Invalid Invite Code)' });
        }
        // Check if already member
        const existingMember = await prisma.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: org.id,
                    userId
                }
            }
        });
        if (existingMember) {
            return res.json(org); // Already joined, just return success
        }
        // Add member
        await prisma.organizationMember.create({
            data: {
                organizationId: org.id,
                userId,
                role: 'member'
            }
        });
        res.json(org);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to join organization' });
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
export const getOrganizationMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const members = await prisma.organizationMember.findMany({
            where: { organizationId: id },
            include: {
                user: true
            }
        });
        // Return just the User objects as expected by the frontend
        const users = members.map(m => m.user);
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch organization members' });
    }
};
