const rateLimit = require("express-rate-limit");

const createUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many URL creation requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = createUrlLimiter;