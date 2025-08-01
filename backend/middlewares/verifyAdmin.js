const User = require('../models/User');

const verifyAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: User is not an admin' });
    }
    // Admin kullanıcısını kontrol et
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(403).json({ error: 'Unauthorized: User not found' });
    }
    // storeId varsa req'e ekle, yoksa null olarak bırak
    req.storeId = user.storeId || null;
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