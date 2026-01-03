import { Router } from 'express';
import { createComment, getTaskComments, deleteComment } from '../controllers/commentController.js';

const router = Router();

router.post('/', createComment);
router.get('/task/:taskId', getTaskComments);
router.delete('/:id', deleteComment);

export default router;
