const mongoose = require('mongoose');

// This is a sub-document schema, it will be embedded inside ApprovalWorkflow
const ApprovalStepSchema = new mongoose.Schema({
    sequence: {
        type: Number,
        required: true,
    },
    approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ruleType: {
        type: String,
        enum: ['PERCENTAGE', 'SPECIFIC', 'HYBRID', 'NONE'],
        default: 'NONE',
    },
    ruleConfig: {
        type: mongoose.Schema.Types.Mixed, // Allows for flexible JSON-like objects
        default: null,
    },
});

const ApprovalWorkflowSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    isManagerFirst: {
        type: Boolean,
        default: false,
    },
    // Embed the steps directly in the workflow document
    steps: [ApprovalStepSchema],
}, {
    timestamps: true,
});

module.exports = mongoose.model('ApprovalWorkflow', ApprovalWorkflowSchema);
