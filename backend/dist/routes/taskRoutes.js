import { Router } from 'express';
import { createTask, updateTask, getTaskById } from '../controllers/taskController.js';
const router = Router();
router.post('/', createTask);
router.put('/:id', updateTask);
router.get('/:id', getTaskById);
export default router;
