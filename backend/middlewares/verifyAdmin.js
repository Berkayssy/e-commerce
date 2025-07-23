const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: User is not an admin' });
    } 
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