import { Router } from 'express';
import { getUsers, createUser, getUserById, syncUser } from '../controllers/userController.js';

const router = Router();

router.get('/', getUsers);
router.post('/', createUser);
router.post('/sync', syncUser);
router.get('/:id', getUserById);

export default router;
