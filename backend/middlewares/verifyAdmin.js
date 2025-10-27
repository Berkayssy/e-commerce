const User = require('../models/User');

module.exports = async function verifyAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: User is not an admin' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(403).json({ error: 'Unauthorized: User not found' });
    }
    req.storeId = user.storeId || null;
    next();
};
