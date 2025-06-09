const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

    const { username, email, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'user' // if role is not provided, default to 'user'
        });
        await newUser.save();

        res.status(201).json({message: "User registered successfully"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({email});
        if (!user) return res.status(404).json({error: "User not found"});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({error: "Invalid credentials"});

        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};    

exports.logout = (req, res) => {
    res.status(200).json({message: "Logout successful"});
};