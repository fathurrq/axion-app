import type { Request, Response } from 'express';
import prisma from '../config/database.js';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, fullName } = req.body;
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        memberships: true,
        assignedTasks: true,
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const syncUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id, email, fullName } = req.body;

    if (!auth0Id || !email) {
      return res.status(400).json({ error: 'auth0Id and email are required' });
    }

    // 1. Try to find user by auth0Id
    let user = await prisma.user.findUnique({
      where: { auth0Id }
    });

    if (user) {
      // Step: Sync existing user (might have changed email or name in Auth0)
      user = await prisma.user.update({
        where: { auth0Id },
        data: { email, fullName }
      });
    } else {
      // 2. Not found by auth0Id, try to find by email (Account Linking case)
      user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        // Link the existing user to this auth0Id
        user = await prisma.user.update({
          where: { email },
          data: { auth0Id, fullName }
        });
      } else {
        // 3. New user altogether
        user = await prisma.user.create({
          data: { auth0Id, email, fullName }
        });
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
};
