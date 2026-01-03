import { Router } from 'express';
import { getProjects, createProject, getProjectById } from '../controllers/projectController.js';

const router = Router();

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);

export default router;
