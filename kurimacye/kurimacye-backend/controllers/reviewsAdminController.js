import prisma from "../prisma.js";

/**
 * ⭐ Get all reviews for admin (with filters)
 */
export const getAllReviews = async (req, res, next) => {
    try {
        const { status, rating, reported, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status && status !== 'all') {
            if (status === 'approved') {
                where.isApproved = true;
            } else if (status === 'pending') {
                where.isApproved = false;
            }
        }
        if (rating) where.rating = parseInt(rating);
        if (reported === 'true') where.reported = true;

        const reviews = await prisma.review.findMany({
            where,
            include: {
                user: { select: { name: true, email: true } },
                product: { select: { name: true, image: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit)
        });

        const total = await prisma.review.count({ where });

        // Stats
        const stats = {
            total: await prisma.review.count(),
            pending: await prisma.review.count({ where: { isApproved: false } }),
            approved: await prisma.review.count({ where: { isApproved: true } }),
            rejected: 0,
            reported: await prisma.review.count({ where: { reported: true } }),
        };

        // Average rating
        const avgRatingResult = await prisma.review.aggregate({
            _avg: { rating: true },
            where: { isApproved: true }
        });

        stats.averageRating = avgRatingResult._avg.rating ? avgRatingResult._avg.rating.toFixed(1) : 0;

        res.json({
            success: true,
            data: reviews,
            stats,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ⭐ Get single review details
 */
export const getReviewDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await prisma.review.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true } },
                product: { select: { name: true, image: true, slug: true, sellerId: true } }
            }
        });

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Note: reply.author is an ID in JSON, if we want the name we might need a separate query
        // But for simplicity we'll keep it as is or handle it in frontend

        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ⭐ Approve review
 */
export const approveReview = async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await prisma.review.update({
            where: { id },
            data: {
                isApproved: true,
                reported: false
            }
        });

        res.json({
            success: true,
            message: "Review approved",
            data: review
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Review not found" });
        }
        next(error);
    }
};

/**
 * ⭐ Reject review
 */
export const rejectReview = async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await prisma.review.update({
            where: { id },
            data: {
                isApproved: false
            }
        });

        res.json({
            success: true,
            message: "Review rejected",
            data: review
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Review not found" });
        }
        next(error);
    }
};

/**
 * ⭐ Reply to review
 */
export const replyToReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: "Reply text is required" });
        }

        const review = await prisma.review.update({
            where: { id },
            data: {
                reply: {
                    text,
                    author: req.user.id,
                    authorName: req.user.name, // Added for easier display
                    createdAt: new Date()
                }
            }
        });

        res.json({
            success: true,
            message: "Reply added",
            data: review
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Review not found" });
        }
        next(error);
    }
};

/**
 * ⭐ Delete review
 */
export const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.review.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: "Review deleted"
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Review not found" });
        }
        next(error);
    }
};

/**
 * ⭐ Clear report flag
 */
export const clearReport = async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await prisma.review.update({
            where: { id },
            data: { reported: false }
        });

        res.json({
            success: true,
            message: "Report cleared",
            data: review
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Review not found" });
        }
        next(error);
    }
};
