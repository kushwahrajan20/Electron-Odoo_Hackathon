const axios = require('axios');
const jwt = require('jsonwebtoken');
const Company = require('../models/company');
const User = require('../models/user');

const generateToken = (id, role, companyId) => {
    return jwt.sign({ id, role, companyId }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

exports.signup = async (req, res, next) => {
    const { companyName, country, name, email, password } = req.body;
    
    if (!companyName || !country || !name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        let currency = 'USD';
        try {
            const response = await axios.get(`https://restcountries.com/v3.1/name/${country}?fullText=true`);
            currency = Object.keys(response.data[0].currencies)[0];
        } catch (error) {
            console.warn(`Could not fetch currency for ${country}. Defaulting to USD.`);
        }

        const newCompany = await Company.create({ name: companyName, defaultCurrency: currency });
        const adminUser = await User.create({
            company: newCompany._id,
            name,
            email,
            password, // Hook will hash it
            role: 'ADMIN',
        });

        res.status(201).json({
            message: 'Company and Admin user created!',
            token: generateToken(adminUser._id, adminUser.role, adminUser.company),
            user: { id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role },
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                message: 'Logged in successfully',
                token: generateToken(user._id, user.role, user.company),
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
};
