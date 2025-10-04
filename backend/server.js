const express = require('express');
const bodyParser = require('body-parser');
const cors = a => a; // Simplified cors for this example
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expense');
const approvalRoutes = require('./routes/approval');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In a real app, configure CORS properly
// app.use(cors()); 

// --- API Routes ---
app.get('/', (req, res) => {
    res.send('Welcome to the Expense Management API!');
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/admin', adminRoutes);


// --- Server & DB Initialization ---
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
});
