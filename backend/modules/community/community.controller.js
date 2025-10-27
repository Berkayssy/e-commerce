const communityService = require('./community.service');

exports.createCommunity = async (req, res) => {
    try {
        const { name, transId, rootAdminId, role } = req.body;
        const result = await communityService.createCommunity({ name, transId, rootAdminId, role });
        res.status(201).json(result);
    }   catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

exports.getCommunities = async (req, res) => {
    try {
        const result = await communityService.getCommunities(req.query);
        res.status(200).json(result);
    }   catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

exports.createOnboardingStore = async (req, res) => {
    try {
        const result = await communityService.createOnboardingStore(req);
        res.status(201).json(result);
    }   catch (err) {
        res.status(err.status || 500).json({ message: err.message, details: err.details || null });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await communityService.getDashboardStats();
        res.status(200).json(stats);
    }   catch (err) {
        res.status(err.status || 500).json({
        error: err.message || 'Failed to retrieve dashboard statistics.',
        details: err.details || null,
        });
    }
};

exports.getCommunityDetails = async (req, res) => {
    try {
        const { communityId } = req.params;
        const community = await communityService.getCommunityDetails(communityId);
        res.status(200).json(community);
    }   catch (err) {
        res.status(err.status || 500).json({
        message: err.message || 'Failed to retrieve community details.',
        details: err.details || null,
        });
    }
};

exports.addAdminToCommunity = async (req, res) => {
    try {
        const { communityId, adminId } = req.body;
        const userId = req.user.id;
        const community = await communityService.addAdminToCommunity({ communityId, adminId, userId });
        res.status(200).json(community);
    }   catch (err) {
        res.status(err.status || 500).json({
        message: err.message || 'Failed to add admin to community.',
        details: err.details || null,
        });
    }
};