const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const {
    getAllAlumniForAdmin,
    getDashboardStats
} = require("../controllers/adminDashController");

// All routes protected with adminAuth middleware
router.use(adminAuth);

// Get all Alumni
router.get("/alumni/all", getAllAlumniForAdmin);

// Get dashboard stats
router.get("/stats", getDashboardStats);

module.exports = router;