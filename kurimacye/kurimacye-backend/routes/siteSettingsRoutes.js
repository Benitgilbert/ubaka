import express from "express";
import {
    getPublicSettings,
    getAllSettings,
    updateTrustBadges,
    updateGeneralSettings,
    updateFooterSettings,
    resetTrustBadges
} from "../controllers/siteSettingsController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/public", getPublicSettings);

// Admin protected routes
router.get("/", verifyAdmin, getAllSettings);
router.put("/trust-badges", verifyAdmin, updateTrustBadges);
router.put("/general", verifyAdmin, upload.single("logo"), updateGeneralSettings);

router.put("/footer", verifyAdmin, updateFooterSettings);
router.post("/trust-badges/reset", verifyAdmin, resetTrustBadges);

export default router;

