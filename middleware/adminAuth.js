const { authMiddleWare, adminMiddleWare } = require("./auth");

const adminAuth = (req, res, next) => {
    authMiddleWare(req, res, (err) => {
        if (err) return next(err);
        adminMiddleWare(req, res, next);
    });
};

module.exports = adminAuth;