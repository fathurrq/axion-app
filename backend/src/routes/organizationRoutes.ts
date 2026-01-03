import { Router } from 'express';
import { getOrganizations, createOrganization, getOrganizationById } from '../controllers/organizationController.js';

const router = Router();

router.get('/', getOrganizations);
router.post('/', createOrganization);
router.get('/:id', getOrganizationById);

export default router;
