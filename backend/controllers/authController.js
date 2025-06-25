const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

exports.googleLogin = async (req, res) => {
    const { token, access_token, userInfo } = req.body;

    try {
        // JWT_SECRET kontrolü
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: "Server configuration error" });
        }

        let userData;
        // Frontend'den gelen veri yapısını kontrol et
        if (token && token.access_token && token.userInfo) {
            userData = {
                email: token.userInfo.email,
                name: token.userInfo.name,
                picture: token.userInfo.picture,
                sub: token.userInfo.id
            };
        } else if (userInfo && access_token) {
            userData = {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                sub: userInfo.id
            };
        } else if (token && typeof token === 'string' && token.includes('.')) {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            userData = ticket.getPayload();
        } else if (token && typeof token === 'string') {
            const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            oauth2Client.setCredentials({ access_token: token });
            const people = require('@googleapis/people');
            const peopleService = people.people({ version: 'v1', auth: oauth2Client });
            const profile = await peopleService.people.get({
                resourceName: 'people/me',
                personFields: 'emailAddresses,names,photos'
            });
            userData = {
                email: profile.data.emailAddresses[0].value,
                name: profile.data.names[0].displayName,
                picture: profile.data.photos?.[0]?.url,
                sub: profile.data.resourceName.split('/')[1]
            };
        } else {
            throw new Error('Invalid token format');
        }

        const { email, name, picture, sub: googleId } = userData;

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                username: name,
                email: email,
                googleId: googleId,
                profilePicture: picture,
                role: 'user',
                password: 'google-auth-' + Math.random().toString(36).substring(2)
            });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.profilePicture = picture;
            await user.save();
        }

        const jwtToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token: jwtToken,
            user: {
                id: user._id,
                role: user.role,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ error: "Google authentication failed: " + err.message });
    }
};