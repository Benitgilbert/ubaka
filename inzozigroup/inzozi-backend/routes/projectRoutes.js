import express from 'express';
import {
  getProjects,
  getProjectBySlug,
  getPendingImpressaApprovals,
  updateImpressaProductStatus,
  getImpressaTickets,
  updateImpressaTicketStatus,
  getPublicShowcaseProjects,
  handleImpressaDataGet,
  handleImpressaDataCreate,
  handleImpressaDataUpdate,
  handleImpressaDataDelete,
  sendImpressaTestEmail,
  verifyImpressaSeller
} from '../controllers/projectController.js';
import { protect, authorizePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get public portfolio showcase details for the landing page
router.get('/public/showcase', getPublicShowcaseProjects);

// Get list of all projects managed by Ubaka Tech
router.get('/', protect, getProjects);

// Get details of a specific project (e.g. linker, homland, etc.)
router.get('/:slug', protect, getProjectBySlug);

// Impressa integrations (Control plane)
router.get('/impressa/approvals', protect, authorizePermission('approve_impressa_products'), getPendingImpressaApprovals);
router.put('/impressa/approvals/:id', protect, authorizePermission('approve_impressa_products'), updateImpressaProductStatus);
router.get('/impressa/tickets', protect, authorizePermission('manage_impressa_tickets'), getImpressaTickets);
router.put('/impressa/tickets/:id', protect, authorizePermission('manage_impressa_tickets'), updateImpressaTicketStatus);

// Generic Impressa CRUD endpoints for all 32 features
router.get('/impressa/data/:feature', protect, handleImpressaDataGet);
router.post('/impressa/data/:feature', protect, handleImpressaDataCreate);
router.put('/impressa/data/:feature/:id', protect, handleImpressaDataUpdate);
router.delete('/impressa/data/:feature/:id', protect, handleImpressaDataDelete);

// Proxy route for email template test triggers
router.post('/impressa/email-templates/test', protect, authorizePermission('manage_impressa_email_templates'), sendImpressaTestEmail);

// Proxy route for seller verification
router.put('/impressa/sellers/:id/verify', protect, authorizePermission('manage_impressa_sellers'), verifyImpressaSeller);

export default router;
