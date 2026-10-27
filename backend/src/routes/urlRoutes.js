
const express = require("express");
const urlController = require("../controllers/urlController");

console.log("CONTROLLER FILE:", require.resolve("../controllers/urlController"));
console.log("deleteUrl type:", typeof urlController.deleteUrl);

const verifyAuth = require("../middleware/verifyAuth");
const createUrlLimiter = require("../middleware/rateLimiter");
const router = express.Router();

router.post("/shorten", createUrlLimiter, verifyAuth, urlController.createShortUrl);
router.get(
    "/user-links",
    verifyAuth,
    urlController.getUserUrls
);
router.get(
    "/:id/analytics",
    verifyAuth,
    urlController.getUrlAnalytics
);
router.get(
    "/:shortId",
    urlController.redirectToOriginalUrl
);
router.patch(
    "/:id/toggle",
    verifyAuth,
    urlController.toggleUrl
);

router.patch(
    "/:id",
    verifyAuth,
    urlController.updateUrl
);

router.delete(
    "/:id",
    verifyAuth,
    urlController.removeUrl
);

module.exports = router;