import type { Request, Response } from 'express';
import prisma from '../config/database.js';

export const createComment = async (req: Request, res: Response) => {
  try {
    const { taskId, userId, content, body } = req.body;

    const comment = await prisma.comment.create({
      data: {
        taskId,
        userId,
        content: content || body // Frontend sends 'body'
      },
      include: {
        user: true
      }
    });

    // Create activity log for the comment
    await prisma.activityLog.create({
      data: {
        entityType: 'task',
        entityId: taskId,
        userId,
        action: 'add_comment',
        metadata: { commentId: comment.id }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

export const getTaskComments = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.comment.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
