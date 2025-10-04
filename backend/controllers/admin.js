const User = require('../models/user');
const Expense = require('../models/expense');
const ApprovalWorkflow = require('../models/approval');

exports.createUser = async (req, res, next) => {
    const { name, email, password, role, managerId } = req.body;
    try {
        const newUser = await User.create({
            name,
            email,
            password,
            role,
            manager: managerId || null,
            company: req.user.companyId,
        });
        res.status(201).json({ id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role });
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    const { userId } = req.params;
    const { role, managerId } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { _id: userId, company: req.user.companyId },
            { role, manager: managerId },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

exports.createWorkflow = async (req, res, next) => {
    const { name, isManagerFirst, steps } = req.body;
    try {
        const newWorkflow = await ApprovalWorkflow.create({
            name,
            isManagerFirst,
            steps,
            company: req.user.companyId,
        });
        res.status(201).json(newWorkflow);
    } catch (error) {
        next(error);
    }
};

exports.getAllCompanyExpenses = async (req, res, next) => {
    try {
        const users = await User.find({ company: req.user.companyId }).select('_id');
        const userIds = users.map(user => user._id);
        const expenses = await Expense.find({ employee: { $in: userIds } })
            .populate('employee', 'name email')
            .sort({ createdAt: -1 });
        res.json(expenses);
    } catch (error) {
        next(error);
    }
};
