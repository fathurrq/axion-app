import { Router } from 'express';
import { createTask, updateTask, getTaskById, getMyTasks, deleteTask } from '../controllers/taskController.js';

const router = Router();

router.post('/', createTask);
router.get('/my', getMyTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/:id', getTaskById);

export default router;
