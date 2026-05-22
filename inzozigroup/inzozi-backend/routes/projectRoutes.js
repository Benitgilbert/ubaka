import express from 'express';
import {
  getProjects,
  getProjectBySlug,
  getPendingImpressaApprovals,
  updateImpressaProductStatus,
  getImpressaTickets,
  updateImpressaTicketStatus,
  getPublicShowcaseProjects
} from '../controllers/projectController.js';
import { protect, authorizePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get public portfolio showcase details for the landing page
router.get('/public/showcase', getPublicShowcaseProjects);

// Get list of all projects managed by Inzozi Group
router.get('/', protect, getProjects);

// Get details of a specific project (e.g. linker, homland, etc.)
router.get('/:slug', protect, getProjectBySlug);

// Impressa integrations (Control plane)
router.get('/impressa/approvals', protect, authorizePermission('approve_products'), getPendingImpressaApprovals);
router.put('/impressa/approvals/:id', protect, authorizePermission('approve_products'), updateImpressaProductStatus);
router.get('/impressa/tickets', protect, authorizePermission('manage_tickets'), getImpressaTickets);
router.put('/impressa/tickets/:id', protect, authorizePermission('manage_tickets'), updateImpressaTicketStatus);

export default router;
