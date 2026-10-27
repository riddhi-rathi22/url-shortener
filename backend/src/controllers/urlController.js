
const Url = require("../models/Url");
const UAParser = require("ua-parser-js");
const createShortUrl = async (req, res) => {
    try {
        const { originalUrl , customAlias ,expiresAt} = req.body;

        if (!originalUrl) {
            return res.status(400).json({
                message: "Original URL is required",
            });
        }


        if (customAlias) {
            const existingUrl = await Url.findOne({ customAlias });

    if (existingUrl) {
        return res.status(400).json({
            message: "Custom alias already exists",
        });
    }
}
        const newUrl = await Url.create({
                       originalUrl: originalUrl,
                       userId: req.userId,
                       customAlias: customAlias || undefined,
                       expiresAt: expiresAt || undefined,
        });

        res.status(201).json({
            message: "URL shortened successfully",
            shortId: newUrl.shortId,
            originalUrl: newUrl.originalUrl,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const redirectToOriginalUrl = async (req, res) => {
    // Prevent cached 410 responses from continuing to show after reactivation.
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    try {
        const { shortId } = req.params;

        const url = await Url.findOne({
    $or: [
        { shortId: shortId },
        { customAlias: shortId },
    ],

});

 console.log("REDIRECT STATUS:", {
    requestedId: shortId,
    found: Boolean(url),
    isActive: url?.isActive,
    urlId: url?._id?.toString(),
 });

 console.log("FOUND URL:", url ? {
    customAlias: url.customAlias,
    shortId: url.shortId,
    isActive: url.isActive,
} : null);

        if (!url) {
            return res.status(404).json({
                message: "Short URL not found",
            });
        }

        if (!url.isActive) {
            return res.status(410).json({
                message: "This URL is inactive",
            });
        }

        if (url.expiresAt && url.expiresAt < new Date()) {
            return res.status(410).json({
                message: "This URL has expired",
            });
        }

       const parser = new UAParser(req.headers["user-agent"]);
const result = parser.getResult();

url.clicks += 1;
url.lastVisited = new Date();

url.visitorStats = {
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
    device: result.device.type || "Desktop",
};

url.clickHistory.push({
    clickedAt: new Date(),
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
    device: result.device.type || "Desktop",
});

await url.save();

        res.redirect(url.originalUrl);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const toggleUrl = async (req, res) => {
    try {
        const { id } = req.params;

        const { isActive } = req.body;
        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be a boolean",
            });
        }

        const url = await Url.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { $set: { isActive } },
            { new: true, runValidators: true }
        );

        console.log("TOGGLE STATUS:", {
            urlId: id,
            requestedIsActive: isActive,
            savedIsActive: url?.isActive,
        });

        if (!url) {
            return res.status(404).json({
                message: "URL not found",
            });
        }

        res.status(200).json({
            message: `URL ${url.isActive ? "activated" : "deactivated"}`,
            isActive: url.isActive,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getUserUrls = async (req, res) => {
    try {
        const urls = await Url.find({
            userId: req.userId,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            links: urls,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

 const removeUrl = async (req, res) => {


    try {
        const { id } = req.params;

        const url = await Url.findOneAndDelete({
            _id: id,
            userId: req.userId,
        });

        if (!url) {
            return res.status(404).json({
                message: "URL not found",
            });
        }

        res.status(200).json({
            message: "URL deleted successfully",
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const updateUrl = async (req, res) => {
    try {
        const { id } = req.params;
        const { originalUrl, customAlias, expiresAt } = req.body;

        const url = await Url.findOne({
            _id: id,
            userId: req.userId,
        });

        if (!url) {
            return res.status(404).json({
                message: "URL not found",
            });
        }

        if (originalUrl) {
            url.originalUrl = originalUrl;
        }

        if (customAlias) {
            const existingUrl = await Url.findOne({
                customAlias,
                _id: { $ne: id },
            });

            if (existingUrl) {
                return res.status(400).json({
                    message: "Custom alias already exists",
                });
            }

            url.customAlias = customAlias;
        }

        if (expiresAt !== undefined) {
            url.expiresAt = expiresAt || undefined;
        }

        await url.save();

        res.status(200).json({
            message: "URL updated successfully",
            link: url,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getUrlAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        const url = await Url.findOne({
            _id: id,
            userId: req.userId,
        });

        if (!url) {
            return res.status(404).json({
                message: "URL not found",
            });
        }

        res.status(200).json({
            analytics: {
                originalUrl: url.originalUrl,
                shortId: url.shortId,
                customAlias: url.customAlias,
                clicks: url.clicks,
                lastVisited: url.lastVisited,
                createdAt: url.createdAt,
                expiresAt: url.expiresAt,
                isActive: url.isActive,
                visitorStats: url.visitorStats,
                clickHistory: url.clickHistory,
            },
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    createShortUrl,
    redirectToOriginalUrl,
    toggleUrl,
    getUserUrls,
    removeUrl,
    updateUrl,
    getUrlAnalytics,
};
