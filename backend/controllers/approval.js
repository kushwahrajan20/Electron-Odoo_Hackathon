const Expense = require('../models/expense');

exports.getPendingApprovals = async (req, res, next) => {
    try {
        // Find expenses where the approvals array contains a PENDING item for the current user
        const expenses = await Expense.find({
            'approvals.approver': req.user.id,
            'approvals.status': 'PENDING',
        }).populate('employee', 'name email');

        res.json(expenses);
    } catch (error) {
        next(error);
    }
};

exports.decideOnExpense = async (req, res, next) => {
    const { expenseId } = req.params;
    const { decision, comment } = req.body; // decision should be 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
        return res.status(400).json({ message: 'Decision must be either APPROVED or REJECTED.' });
    }
    if (decision === 'REJECTED' && !comment) {
        return res.status(400).json({ message: 'Comment is required for rejection.' });
    }

    try {
        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found.' });
        }

        const currentApprovalIndex = expense.approvals.findIndex(
            appr => appr.approver.toString() === req.user.id && appr.status === 'PENDING'
        );

        if (currentApprovalIndex === -1) {
            return res.status(404).json({ message: 'No pending approval for you on this expense.' });
        }

        // --- Update current approval step ---
        expense.approvals[currentApprovalIndex].status = decision;
        expense.approvals[currentApprovalIndex].comment = comment;
        expense.approvals[currentApprovalIndex].decisionDate = new Date();

        if (decision === 'REJECTED') {
            expense.status = 'REJECTED';
        } else {
            // --- Activate next approver if one exists ---
            const nextApprovalIndex = currentApprovalIndex + 1;
            if (nextApprovalIndex < expense.approvals.length) {
                expense.approvals[nextApprovalIndex].status = 'PENDING';
            } else {
                // This was the last approver, finalize the expense
                expense.status = 'APPROVED';
            }
        }

        await expense.save();
        res.json(expense);
    } catch (error) {
        next(error);
    }
};
