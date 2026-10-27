

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const urlRoutes = require("./routes/urlRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("URL Shortener Backend is running 🚀");
});

app.use("/api/urls", urlRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;