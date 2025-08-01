const express = require('express');
const router = express.Router();
const Community = require('../models/Community');

router.get("/", (req, res) => {
    res.status(200).json({message: "pong"});
});

router.get('/communities', async (req, res) => {
  try {
    const Product = require('../models/Product');
    
    // Get communities with plan info
    const communities = await Community.find()
      .populate('plan', 'name price features')
      .select('name transId _id logo description plan');
    
    // Get product counts and member counts for each community
    const communitiesWithCounts = await Promise.all(
      communities.map(async (community) => {
        const productCount = await Product.countDocuments({ communityId: community._id });
        
        // Get member count (users who have ordered from this community)
        const Order = require('../models/Order');
        const memberCount = await Order.distinct('user', { 
          communityIds: community._id,
          user: { $exists: true, $ne: null }
        }).countDocuments();
        
        // Calculate rating based on various factors (placeholder for now)
        const rating = Math.min(5, Math.max(3.5, 4 + (productCount * 0.1) + (memberCount * 0.05)));
        
        return {
          ...community.toObject(),
          productCount,
          memberCount: memberCount || 0,
          rating: parseFloat(rating.toFixed(1))
        };
      })
    );
    
    res.status(200).json({ communities: communitiesWithCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;