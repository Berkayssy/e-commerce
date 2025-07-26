const User = require('../models/User');

const verifyAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: User is not an admin' });
    }
    // Admin sadece kendi mağazasına erişebilmeli
    const user = await User.findById(req.user.id);
    if (!user || !user.storeId) {
        return res.status(403).json({ error: 'Unauthorized: No store assigned' });
    }
    req.storeId = user.storeId;
    next();
};

const verifySeller = (req, res, next) => {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: User is not a seller or admin' });
    }
    next();
};

module.exports = {
    verifyAdmin,
    verifySeller
};