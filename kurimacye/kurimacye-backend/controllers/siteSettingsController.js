import prisma from "../prisma.js";

/**
 * ⚙️ Helper to get or create settings
 */
const getSettingsHelper = async () => {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
        settings = await prisma.siteSettings.create({
            data: {
                siteName: "Kuri Macye",
                tagline: "Your Marketplace",
                trustBadges: [
                    { icon: 'truck', title: 'Free Delivery', description: 'On orders over 50,000 Rwf', isActive: true, order: 0 },
                    { icon: 'shield', title: 'Secure Payment', description: '100% protected', isActive: true, order: 1 },
                    { icon: 'undo', title: 'Easy Returns', description: '30-day policy', isActive: true, order: 2 },
                    { icon: 'headset', title: '24/7 Support', description: 'Always here to help', isActive: true, order: 3 }
                ],
                socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' }
            }
        });
    }
    return settings;
};

/**
 * ⚙️ Get site settings (public - for frontend)
 */
export const getPublicSettings = async (req, res, next) => {
    try {
        const settings = await getSettingsHelper();

        // Filter to only active trust badges and sort by order
        const trustBadges = Array.isArray(settings.trustBadges) ? settings.trustBadges : [];
        const activeTrustBadges = trustBadges
            .filter(badge => badge.isActive)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        res.json({
            success: true,
            data: {
                trustBadges: activeTrustBadges,
                siteName: settings.siteName,
                tagline: settings.tagline,
                footerTagline: settings.footerTagline,
                contactEmail: settings.contactEmail,
                contactPhone: settings.contactPhone,
                contactAddress: settings.contactAddress,
                googleMapsQuery: settings.googleMapsQuery,
                logo: settings.logo,
                socialLinks: settings.socialLinks || {}
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ⚙️ Get all site settings (admin)
 */
export const getAllSettings = async (req, res, next) => {
    try {
        const settings = await getSettingsHelper();

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ⚙️ Update trust badges
 */
export const updateTrustBadges = async (req, res, next) => {
    try {
        const { trustBadges } = req.body;

        if (!Array.isArray(trustBadges)) {
            const error = new Error("Trust badges must be an array");
            error.statusCode = 400;
            return next(error);
        }

        const settings = await getSettingsHelper();
        const updated = await prisma.siteSettings.update({
            where: { id: settings.id },
            data: { trustBadges }
        });

        res.json({
            success: true,
            message: "Trust badges updated successfully",
            data: updated.trustBadges
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ⚙️ Update general site settings
 */
export const updateGeneralSettings = async (req, res, next) => {
    try {
        const { siteName, tagline, contactEmail, contactPhone } = req.body;
        const settings = await getSettingsHelper();

        // Handle logo upload if present
        let logo = undefined;
        if (req.file) {
            logo = req.file.path;
        }

        const updated = await prisma.siteSettings.update({
            where: { id: settings.id },
            data: {
                siteName: siteName !== undefined ? siteName : undefined,
                tagline: tagline !== undefined ? tagline : undefined,
                contactEmail: contactEmail !== undefined ? contactEmail : undefined,
                contactPhone: contactPhone !== undefined ? contactPhone : undefined,
                logo: logo
            }
        });

        res.json({
            success: true,
            message: "Settings updated successfully",
            data: updated
        });
    } catch (error) {
        next(error);
    }
};


/**
 * ⚙️ Update footer settings
 */
export const updateFooterSettings = async (req, res, next) => {
    try {
        const { footerTagline, contactEmail, contactPhone, contactAddress, googleMapsQuery, socialLinks } = req.body;
        const settings = await getSettingsHelper();

        const data = {};
        if (footerTagline !== undefined) data.footerTagline = footerTagline;
        if (contactEmail !== undefined) data.contactEmail = contactEmail;
        if (contactPhone !== undefined) data.contactPhone = contactPhone;
        if (contactAddress !== undefined) data.contactAddress = contactAddress;
        if (googleMapsQuery !== undefined) data.googleMapsQuery = googleMapsQuery;
        if (socialLinks !== undefined) {
            data.socialLinks = {
                facebook: socialLinks.facebook || '',
                twitter: socialLinks.twitter || '',
                instagram: socialLinks.instagram || '',
                linkedin: socialLinks.linkedin || ''
            };
        }

        const updated = await prisma.siteSettings.update({
            where: { id: settings.id },
            data
        });

        res.json({
            success: true,
            message: "Footer settings updated successfully",
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ⚙️ Reset trust badges to default
 */
export const resetTrustBadges = async (req, res, next) => {
    try {
        const settings = await getSettingsHelper();

        const updated = await prisma.siteSettings.update({
            where: { id: settings.id },
            data: {
                trustBadges: [
                    { icon: 'truck', title: 'Free Delivery', description: 'On orders over 50,000 Rwf', isActive: true, order: 0 },
                    { icon: 'shield', title: 'Secure Payment', description: '100% protected', isActive: true, order: 1 },
                    { icon: 'undo', title: 'Easy Returns', description: '30-day policy', isActive: true, order: 2 },
                    { icon: 'headset', title: '24/7 Support', description: 'Always here to help', isActive: true, order: 3 }
                ]
            }
        });

        res.json({
            success: true,
            message: "Trust badges reset to defaults",
            data: updated.trustBadges
        });
    } catch (error) {
        next(error);
    }
};
