const Alumni = require("../models/Alumni");
const Event = require("../models/Events");
const Album = require("../models/Album");

// GET /api/admin/dashboard/alumni/all
exports.getAllAlumniForAdmin = async (req, res) => {
  try {
    const {
      status,
      search,
      department,
      batchYear,
      sortBy,
      page = 1,
      limit = 20,
    } = req.query;

    let filter = { role: "Alumni" };
    if (status === "pending") filter.isApproved = false;
    else if (status === "approved") filter.isApproved = true;
    if (department) filter.department = department;
    if (batchYear) filter.batchYear = batchYear === "null" ? null : batchYear;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === "name") sortOptions = { firstName: 1, lastName: 1 };
    else if (sortBy === "email") sortOptions = { email: 1 };
    else if (sortBy === "year") sortOptions = { batchYear: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const alumni = await Alumni.find(filter)
      .select("-password")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalAlumni = await Alumni.countDocuments(filter);
    const totalApproved = await Alumni.countDocuments({
      ...filter,
      isApproved: true,
    });
    const totalPending = await Alumni.countDocuments({
      ...filter,
      isApproved: false,
    });

    res.json({
      message: "Alumni retrieved successfully",
      count: alumni.length,
      alumni,
      totalAlumni,
      totalApproved,
      totalPending,
      currentPage: parseInt(page),
      totalPages: Math.ceil(
        (await Alumni.countDocuments(filter)) / parseInt(limit),
      ),
    });
  } catch (error) {
    console.error("Get All Alumni Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/admin/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalAlumni,
      approvedAlumni,
      pendingAlumni,
      totalEvents,
      albumsCount,
    ] = await Promise.all([
      Alumni.countDocuments({ role: "Alumni" }),
      Alumni.countDocuments({ role: "Alumni", isApproved: "true" }),
      Alumni.countDocuments({ role: "Alumni", isApproved: "false" }),
      Event.countDocuments(),
      Album.countDocuments(),
    ]);

    res.json({
      message: "Dashboard statistics retrieved successfully",
      status: {
        totalAlumni: totalAlumni || 0,
        approvedAlumni: approvedAlumni || 0,
        pendingAlumni: pendingAlumni || 0,
        totalEvents: totalEvents || 0,
        totalAlbums: albumsCount || 0,
      },
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
