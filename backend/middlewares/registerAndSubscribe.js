exports.registerAndSubscribe = async (req, res, next) => {
    const { username, email, password, storeName, phone, country, city, address, plan, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        let userRole = role;
        if (isAdminEmail(email)) {
            userRole = 'admin';
        } else if (role === 'seller') {
            userRole = 'seller';
        } else {
            userRole = 'user';
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: userRole
        });
        await newUser.save();

        req.newUser = newUser;
        req.userRole = userRole;

        if (userRole === 'seller') {
            const planDoc = await Plan.findById(plan);
            if (!planDoc) {
                return res.status(400).json({ message: "Invalid plan selected" });
            }
            req.plan = planDoc;
            req.sellerInfo = { name: username, phone, country, city, address };
        }

        next();
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}