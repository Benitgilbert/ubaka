import prisma from "../prisma.js";

/**
 * ✅ Get commission settings (admin)
 */
export const getCommissionSettings = async (req, res, next) => {
    try {
        let settings = await prisma.commissionSettings.findFirst();
        if (!settings) {
            settings = await prisma.commissionSettings.create({ data: {} });
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};

export const updateCommissionSettings = async (req, res, next) => {
    try {
        const { 
            defaultRate, 
            posRate, 
            minimumPayoutAmount, 
            payoutSchedule, 
            payoutMethods, 
            categoryRates,
            sellerRates,
            autoPayoutEnabled,
            maxAutoPayoutAmount,
            sellerAutoApproval
        } = req.body;

        const currentSettings = await prisma.commissionSettings.findFirst();
        
        let autoApprovalObj = sellerAutoApproval;
        if (typeof autoApprovalObj === 'string' && autoApprovalObj.trim() !== '') {
            try {
                autoApprovalObj = JSON.parse(autoApprovalObj);
            } catch (e) {
                // Keep as string if parsing fails
            }
        }

        const settings = await prisma.commissionSettings.upsert({
            where: { id: currentSettings?.id || 'default' },
            update: {
                defaultRate: defaultRate !== undefined ? Number(defaultRate) : undefined,
                posRate: posRate !== undefined ? Number(posRate) : undefined,
                minimumPayoutAmount: minimumPayoutAmount !== undefined ? Number(minimumPayoutAmount) : undefined,
                payoutSchedule,
                payoutMethods,
                categoryRates,
                sellerRates,
                autoPayoutEnabled: autoPayoutEnabled !== undefined ? (autoPayoutEnabled === true || autoPayoutEnabled === 'true') : undefined,
                maxAutoPayoutAmount: maxAutoPayoutAmount !== undefined ? Number(maxAutoPayoutAmount) : undefined,
                sellerAutoApproval: autoApprovalObj !== undefined ? autoApprovalObj : undefined,
                updatedBy: req.user.id
            },
            create: {
                defaultRate: defaultRate !== undefined ? Number(defaultRate) : 10,
                posRate: posRate !== undefined ? Number(posRate) : 5,
                minimumPayoutAmount: minimumPayoutAmount !== undefined ? Number(minimumPayoutAmount) : 10000,
                payoutSchedule: payoutSchedule || 'weekly',
                payoutMethods: payoutMethods || ['mobile_money'],
                categoryRates: categoryRates || {},
                sellerRates: sellerRates || {},
                autoPayoutEnabled: autoPayoutEnabled === true || autoPayoutEnabled === 'true',
                maxAutoPayoutAmount: maxAutoPayoutAmount !== undefined ? Number(maxAutoPayoutAmount) : 500000,
                sellerAutoApproval: autoApprovalObj || { enabled: false, minScore: 70, criteria: {} },
                updatedBy: req.user.id
            }
        });

        res.json({ success: true, message: "Commission settings updated", data: settings });
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ Get all seller earnings (admin)
 */
export const getAllEarnings = async (req, res, next) => {
    try {
        const { sellerId, status, page = 1, limit = 20 } = req.query;

        const where = {};
        if (sellerId) where.sellerId = sellerId;
        if (status) where.status = status;

        const [earnings, total, aggregations] = await Promise.all([
            prisma.sellerEarning.findMany({
                where,
                include: {
                    seller: { select: { name: true, email: true, storeName: true } },
                    product: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit)
            }),
            prisma.sellerEarning.count({ where }),
            prisma.sellerEarning.aggregate({
                where,
                _sum: { grossAmount: true, commissionAmount: true, netAmount: true }
            })
        ]);

        res.json({
            success: true,
            data: earnings,
            totals: {
                totalGross: aggregations._sum.grossAmount || 0,
                totalCommission: aggregations._sum.commissionAmount || 0,
                totalNet: aggregations._sum.netAmount || 0
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ Get seller earnings summary (for dashboard)
 */
export const getSellerEarningsSummary = async (req, res, next) => {
    try {
        const sellerId = req.user.role === 'cashier' ? req.user.managedById : req.user.id;

        const [pendingAgg, paidAgg, settings, pendingPayouts] = await Promise.all([
            prisma.sellerEarning.aggregate({
                where: { sellerId, status: { in: ["pending", "confirmed"] } },
                _sum: { netAmount: true },
                _count: true
            }),
            prisma.sellerEarning.aggregate({
                where: { sellerId, status: "paid" },
                _sum: { netAmount: true },
                _count: true
            }),
            prisma.commissionSettings.findFirst(),
            prisma.payout.count({
                where: { sellerId, status: { in: ["pending", "processing"] } }
            })
        ]);

        res.json({
            success: true,
            data: {
                availableBalance: pendingAgg._sum.netAmount || 0,
                pendingOrders: pendingAgg._count || 0,
                totalPaid: paidAgg._sum.netAmount || 0,
                paidOrders: paidAgg._count || 0,
                minimumPayout: settings?.minimumPayoutAmount || 10000,
                pendingPayouts
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ Get dashboard stats for admin
 */
export const getCommissionDashboard = async (req, res, next) => {
    try {
        const [platformAgg, pendingPayoutAgg, completedPayoutAgg, activeSellers] = await Promise.all([
            prisma.sellerEarning.aggregate({ _sum: { commissionAmount: true } }),
            prisma.payout.aggregate({
                where: { status: { in: ["pending", "processing"] } },
                _sum: { amount: true },
                _count: true
            }),
            prisma.payout.aggregate({
                where: { status: "completed" },
                _sum: { amount: true },
                _count: true
            }),
            prisma.sellerEarning.groupBy({ by: ['sellerId'] })
        ]);

        res.json({
            success: true,
            data: {
                platformEarnings: platformAgg._sum.commissionAmount || 0,
                pendingPayouts: {
                    amount: pendingPayoutAgg._sum.amount || 0,
                    count: pendingPayoutAgg._count || 0
                },
                completedPayouts: {
                    amount: completedPayoutAgg._sum.amount || 0,
                    count: completedPayoutAgg._count || 0
                },
                activeSellers: activeSellers.length
            }
        });
    } catch (error) {
        next(error);
    }
};
