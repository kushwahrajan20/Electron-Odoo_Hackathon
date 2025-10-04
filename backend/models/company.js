const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
    },
    defaultCurrency: {
        type: String,
        required: [true, 'Default currency is required'],
        uppercase: true,
        minlength: 3,
        maxlength: 3,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Company', CompanySchema);
