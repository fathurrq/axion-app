import { Router } from 'express';
import { getOrganizations, createOrganization, joinOrganization, getOrganizationById, getOrganizationMembers } from '../controllers/organizationController.js';

const router = Router();

router.get('/', getOrganizations);
router.post('/', createOrganization);
router.post('/join', joinOrganization);
router.get('/:id/members', getOrganizationMembers);
router.get('/:id', getOrganizationById);

export default router;
