const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Seller = require("../models/Seller");
const Plan = require("../models/Plan");
const Community = require("../models/Community");
const Notification = require("../models/Notification");
const Subscription = require("../models/Subscription");

// Seller Registration with Payment
exports.registerSeller = async (req, res) => {
    try {
        const {
            name,
            surname,
            email,
            password,
            phone,
            country,
            city,
            address,
            planId,
            cardNumber,
            cardExpiry,
            cardCvv,
            billingAddress
        } = req.body;

        // Validate required fields
        if (!name || !surname || !email || !password || !phone || !country || !city || !address || !planId) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Validate plan
        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(400).json({ message: "Invalid plan selected" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate unique username from email
        const emailPrefix = email.split('@')[0];
        let username = emailPrefix;
        let counter = 1;
        
        // Check if username exists and generate unique one
        while (await User.findOne({ username })) {
            username = `${emailPrefix}${counter}`;
            counter++;
        }

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: 'seller'
        });
        await user.save();

        // Calculate plan end date
        const now = new Date();
        const planEndDate = new Date(now.getTime() + (plan.durationDays * 24 * 60 * 60 * 1000));

        // Create subscription
        const subscription = new Subscription({
            user: user._id,
            plan: plan._id,
            startDate: now,
            endDate: planEndDate,
            isActive: true
        });
        await subscription.save();

        // Create seller profile
        const seller = new Seller({
            userId: user._id,
            name,
            surname,
            phone,
            country,
            city,
            address,
            planId: plan._id,
            planEndDate,
            subscriptionId: subscription._id, // Link subscription to seller
            cardInfo: {
                cardNumber: cardNumber || null,
                cardExpiry: cardExpiry || null,
                cardCvv: cardCvv || null,
                billingAddress: billingAddress || address
            },
            status: plan.price === 0 ? 'active' : 'pending' // Free plans are active immediately
        });
        await seller.save();

        // Create JWT token with both user and seller info
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
                sellerId: seller._id
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send welcome notification
        await Notification.create({
            user: user._id,
            store: null, // Will be set when store is created
            type: 'welcome',
            message: `Welcome ${name}! Your seller account has been created successfully.`,
            email: email
        });

        res.status(201).json({
            message: "Seller registered successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
            seller: {
                id: seller._id,
                name: seller.name,
                surname: seller.surname,
                planId: seller.planId,
                planEndDate: seller.planEndDate,
                subscriptionId: seller.subscriptionId,
                status: seller.status
            }
        });

    } catch (error) {
        console.error("Seller registration error:", error);
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.email) {
                return res.status(400).json({ message: "Email already exists. Please use a different email address." });
            }
            if (error.keyPattern && error.keyPattern.username) {
                return res.status(400).json({ message: "Username already exists. Please try again." });
            }
            return res.status(400).json({ message: "Duplicate entry found. Please check your information." });
        }
        
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get Seller Profile
exports.getSellerProfile = async (req, res) => {
    try {
        const sellerId = req.user.sellerId;
        
        const seller = await Seller.findById(sellerId)
            .populate('userId', 'email username profilePicture role')
            .populate('planId', 'name price durationDays features')
            .populate('storeId', 'name logo');

        if (!seller) {
            return res.status(404).json({ message: "Seller profile not found" });
        }

        res.json(seller);
    } catch (error) {
        console.error("Get seller profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update Seller Profile
exports.updateSellerProfile = async (req, res) => {
    try {
        const sellerId = req.user.sellerId;
        const {
            name,
            surname,
            phone,
            country,
            city,
            address,
            emailNotifications,
            planReminders
        } = req.body;

        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }

        // Update seller fields
        if (name) seller.name = name;
        if (surname) seller.surname = surname;
        if (phone) seller.phone = phone;
        if (country) seller.country = country;
        if (city) seller.city = city;
        if (address) seller.address = address;
        if (emailNotifications !== undefined) seller.emailNotifications = emailNotifications;
        if (planReminders !== undefined) seller.planReminders = planReminders;

        await seller.save();

        // Update user username if name/surname changed
        if (name || surname) {
            const user = await User.findById(seller.userId);
            if (user) {
                user.username = `${seller.name} ${seller.surname}`;
                await user.save();
            }
        }

        res.json({ message: "Profile updated successfully", seller });
    } catch (error) {
        console.error("Update seller profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update Billing Information
exports.updateBillingInfo = async (req, res) => {
    try {
        const sellerId = req.user.sellerId;
        const { cardNumber, cardExpiry, cardCvv, billingAddress } = req.body;

        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }

        // Update card info (in production, encrypt these fields)
        if (cardNumber) seller.cardInfo.cardNumber = cardNumber;
        if (cardExpiry) seller.cardInfo.cardExpiry = cardExpiry;
        if (cardCvv) seller.cardInfo.cardCvv = cardCvv;
        if (billingAddress) seller.cardInfo.billingAddress = billingAddress;

        await seller.save();

        res.json({ message: "Billing information updated successfully" });
    } catch (error) {
        console.error("Update billing info error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get Seller Plan Status
exports.getPlanStatus = async (req, res) => {
    try {
        const sellerId = req.user.sellerId;
        
        const seller = await Seller.findById(sellerId)
            .populate('planId', 'name price durationDays features');

        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }

        const now = new Date();
        const isExpired = seller.planEndDate < now;
        const daysRemaining = Math.ceil((seller.planEndDate - now) / (1000 * 60 * 60 * 24));

        res.json({
            plan: seller.planId,
            planEndDate: seller.planEndDate,
            isActive: seller.isActive,
            isExpired,
            daysRemaining: isExpired ? 0 : daysRemaining,
            status: seller.status
        });
    } catch (error) {
        console.error("Get plan status error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Upgrade/Downgrade Plan
exports.changePlan = async (req, res) => {
    try {
        const sellerId = req.user.sellerId;
        const { newPlanId, cardNumber, cardExpiry, cardCvv } = req.body;

        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }

        const newPlan = await Plan.findById(newPlanId);
        if (!newPlan) {
            return res.status(400).json({ message: "Invalid plan selected" });
        }

        // Update plan
        seller.planId = newPlan._id;
        seller.planStartDate = new Date();
        seller.planEndDate = new Date(Date.now() + (newPlan.durationDays * 24 * 60 * 60 * 1000));
        seller.isActive = true;
        seller.status = 'active';

        // Update card info if provided
        if (cardNumber) seller.cardInfo.cardNumber = cardNumber;
        if (cardExpiry) seller.cardInfo.cardExpiry = cardExpiry;
        if (cardCvv) seller.cardInfo.cardCvv = cardCvv;

        await seller.save();

        // Send notification
        await Notification.create({
            user: seller.userId,
            store: seller.storeId,
            type: 'plan_change',
            message: `Your plan has been changed to ${newPlan.name}.`,
            email: (await User.findById(seller.userId)).email
        });

        res.json({ 
            message: "Plan changed successfully",
            newPlan: newPlan.name,
            planEndDate: seller.planEndDate
        });
    } catch (error) {
        console.error("Change plan error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}; 

// Assign Admin to Store (by Seller)
exports.assignAdmin = async (req, res) => {
    try {
        const sellerId = req.user.sellerId;
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        // Find seller and their store
        const seller = await Seller.findById(sellerId).populate('storeId');
        if (!seller || !seller.storeId) {
            return res.status(400).json({ message: 'Seller or store not found' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin' && user.storeId && user.storeId.equals(seller.storeId._id)) {
            return res.status(400).json({ message: 'User is already an admin for this store' });
        }

        // Update user to admin for this store
        user.role = 'admin';
        user.storeId = seller.storeId._id;
        await user.save();

        // Notification (optional)
        await Notification.create({
            user: user._id,
            store: seller.storeId._id,
            type: 'admin_assign',
            message: `You have been assigned as an admin for store ${seller.storeId.name}.`,
            email: user.email
        });

        res.json({ message: 'Admin assigned successfully', admin: { id: user._id, email: user.email } });
    } catch (error) {
        console.error('Assign admin error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; 

// Get Seller's Community
exports.getMyCommunity = async (req, res) => {
    try {
        const sellerId = req.user.sellerId;
        
        const seller = await Seller.findById(sellerId)
            .populate('storeId', 'name logo');

        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }

        if (!seller.storeId) {
            return res.status(404).json({ message: "Seller has no community/store" });
        }

        res.json({ community: seller.storeId });
    } catch (error) {
        console.error("Get seller community error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}; 