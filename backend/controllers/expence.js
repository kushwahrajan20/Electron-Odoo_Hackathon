const Expense = require('../models/expense');
const User = require('../models/user');
const ApprovalWorkflow = require('../models/approval');

exports.createExpense = async (req, res, next) => {
    const { amount, currency, category, description, expenseDate, receiptUrl } = req.body;
    const employeeId = req.user.id;

    try {
        const employee = await User.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }
        
        // --- Approval Engine Logic Starts Here ---
        // Find the default workflow for the company. A real app might have more complex rules.
        const workflow = await ApprovalWorkflow.findOne({ company: req.user.companyId });
        if (!workflow) {
            return res.status(400).json({ message: 'No approval workflow configured for your company.' });
        }
        
        let approvals = [];
        let isFirstApprover = true;

        // 1. Add manager if required
        if (workflow.isManagerFirst && employee.manager) {
            approvals.push({
                approver: employee.manager,
                status: 'PENDING', // The first approver is pending
            });
            isFirstApprover = false;
        }

        // 2. Add workflow steps
        workflow.steps.sort((a, b) => a.sequence - b.sequence).forEach(step => {
            approvals.push({
                approver: step.approver,
                status: isFirstApprover ? 'PENDING' : 'QUEUED',
            });
            isFirstApprover = false; // All subsequent approvers are queued
        });
        
        if (approvals.length === 0) {
            return res.status(400).json({ message: "Approval workflow is empty. Cannot submit expense." });
        }

        const newExpense = await Expense.create({
            employee: employeeId,
            amount,
            currency,
            category,
            description,
            expenseDate,
            receiptUrl,
            approvals, // Add the generated approval chain
        });

        res.status(201).json(newExpense);
    } catch (error) {
        next(error);
    }
};

exports.getMyExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.find({ employee: req.user.id })
            .populate('approvals.approver', 'name email') // Populate approver info
            .sort({ expenseDate: -1 });
            
        res.json(expenses);
    } catch (error) {
        next(error);
    }
};
