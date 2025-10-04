const mongoose = require('mongoose');

// This sub-document will be embedded in the Expense model
const ApprovalHistorySchema = new mongoose.Schema({
    approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'QUEUED'],
        required: true,
        default: 'QUEUED', // Start as queued until it's their turn
    },
    comment: {
        type: String,
        trim: true,
    },
    decisionDate: {
        type: Date,
    },
});

const ExpenseSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        uppercase: true,
        minlength: 3,
        maxlength: 3,
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    expenseDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
    },
    receiptUrl: {
        type: String,
        trim: true,
    },
    // Embed the approval history directly within the expense
    approvals: [ApprovalHistorySchema],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Expense', ExpenseSchema);
