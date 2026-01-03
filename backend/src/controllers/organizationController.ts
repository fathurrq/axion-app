import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import prisma from '../config/database.js';

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const organizations = await prisma.organization.findMany({
      where: { deletedAt: null }
    });
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
};

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const { name, ownerId } = req.body;
    
    // Transaction to create org and add owner member
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to create organization' });
  }
};

export const getOrganizationById = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
};
