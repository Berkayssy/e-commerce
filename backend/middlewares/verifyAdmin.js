const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: User is not an admin' });
    } 
        next();
};
module.exports = verifyAdmin;