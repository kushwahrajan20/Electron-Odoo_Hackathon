import React, { useState, useEffect, createContext, useContext } from 'react';
import { LogOut, LayoutDashboard, DollarSign, Wallet, FileText, Settings, UserPlus, Zap } from 'lucide-react';

// --- Global State and Context Setup ---

// Mock API Base URL (connects to your generated backend)
const API_BASE_URL = '/api'; 

// User data structure: role determines the view
const initialUserState = {
    isAuthenticated: false,
    user: null,
    role: 'Guest', // Guest, Employee, Manager, Admin
    token: null,
    companyCurrency: 'USD',
    userId: 'default-user-id' // Used for Firestore paths if needed, but here mainly for logging
};

const AuthContext = createContext(initialUserState);

const useAuth = () => useContext(AuthContext);

// --- Auth Provider Component ---
const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState(() => {
        // Attempt to load from localStorage on initial load (for persistence mock)
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : initialUserState;
    });
    
    // Auth Token placeholder (not used for real Firebase, but good for local React dev)
    const token = 'MOCK_JWT_TOKEN'; 

    const login = (userData) => {
        const newState = {
            isAuthenticated: true,
            user: userData,
            role: userData.role,
            token: token,
            companyCurrency: 'USD', // Mocked, should come from API
            userId: userData._id || 'mock-id'
        };
        setAuthState(newState);
        localStorage.setItem('user', JSON.stringify(newState));
        return newState;
    };

    const logout = () => {
        setAuthState(initialUserState);
        localStorage.removeItem('user');
    };

    // Mock API function (must be updated to use actual 'fetch' with authentication headers)
    const api = async (endpoint, options = {}) => {
        console.log(`[API MOCK] Calling ${endpoint} with options:`, options);
        // Simulate adding Authorization header if authenticated
        // options.headers = { ...options.headers, 'Authorization': `Bearer ${authState.token}` };
        
        // This should be replaced with actual fetch/axios calls to your backend:
        // const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        // return response.json();
        
        // Mock success response for submission
        return { success: true, data: { status: 'Pending', id: 'mock-expense-123' } };
    };


    return (
        <AuthContext.Provider value={{ ...authState, login, logout, api }}>
            {children}
        </AuthContext.Provider>
    );
};


// --- UI Components ---

const Notification = ({ message, type }) => {
    if (!message) return null;
    const baseClasses = "fixed bottom-5 right-5 p-4 rounded-xl shadow-2xl text-white font-semibold transition-opacity duration-300 z-50";
    const colorClasses = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    
    return (
        <div className={`${baseClasses} ${colorClasses}`}>
            {message}
        </div>
    );
};

const Card = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-xl border border-gray-100 ${className}`}>
        {title && <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h2>}
        {children}
    </div>
);

const Button = ({ children, onClick, variant = 'primary', icon, disabled = false, className = '' }) => {
    const baseStyle = "flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md";
    let colorStyle = '';
    
    if (disabled) {
        colorStyle = 'bg-gray-300 text-gray-500 cursor-not-allowed';
    } else {
        switch (variant) {
            case 'secondary':
                colorStyle = 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
                break;
            case 'danger':
                colorStyle = 'bg-red-500 text-white hover:bg-red-600';
                break;
            case 'success':
                colorStyle = 'bg-green-500 text-white hover:bg-green-600';
                break;
            case 'primary':
            default:
                colorStyle = 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5';
                break;
        }
    }

    return (
        <button 
            onClick={onClick} 
            className={`${baseStyle} ${colorStyle} ${className}`} 
            disabled={disabled}
        >
            {icon && icon}
            <span>{children}</span>
        </button>
    );
};

// --- Page Components ---

const LoginPage = ({ onLoginSuccess }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [countryName, setCountryName] = useState('India'); // Required for Admin/Company setup
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // This should be replaced with actual API calls to your backend
        const endpoint = isRegister ? '/auth/register' : '/auth/login';
        const body = { email, password };
        if (isRegister) {
            body.name = name;
            body.countryName = countryName;
        }

        try {
            // Mocking API call success
            const mockUser = {
                _id: 'u123',
                name: name || 'Mock User',
                email: email,
                role: isRegister ? (email === 'admin@company.com' ? 'Admin' : 'Employee') : 'Manager', // Mock dynamic role
                companyCurrency: 'USD'
            };

            // const response = await fetch(`${API_BASE_URL}${endpoint}`, { /* ... */ });
            // const data = await response.json();
            
            // Assuming successful login for mock
            login(mockUser);
            onLoginSuccess();
        } catch (err) {
            setError(isRegister ? 'Registration failed. Try again.' : 'Login failed. Check credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="max-w-md w-full">
                <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
                    {isRegister ? 'Create Account' : 'Sign In'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <>
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <input 
                                type="text" 
                                placeholder="Country (For Currency Setup)" 
                                value={countryName} 
                                onChange={(e) => setCountryName(e.target.value)} 
                                required 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </>
                    )}
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Processing...' : isRegister ? 'Register & Setup Company' : 'Log In'}
                    </Button>
                </form>
                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setIsRegister(!isRegister)} 
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                        {isRegister ? 'Already have an account? Sign In' : 'Need an account? Sign Up (First user becomes Admin)'}
                    </button>
                </div>
            </Card>
        </div>
    );
};

// --- Employee Dashboard Views ---

const ExpenseSubmissionForm = () => {
    const { api, user, companyCurrency } = useAuth();
    const [form, setForm] = useState({
        amount: '', currency: 'USD', category: 'Travel', description: '', date: new Date().toISOString().substring(0, 10), receiptData: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');

    const categories = ['Travel', 'Meal', 'Software', 'Office Supplies', 'Training'];

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'receipt') {
            // Mock file-to-base64 conversion for OCR endpoint
            const file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setForm(f => ({ ...f, receiptData: reader.result }));
                reader.readAsDataURL(file);
            }
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleOCR = async () => {
        if (!form.receiptData) return;
        setSubmitting(true);
        setMessage('Processing receipt via OCR...');
        
        // Mocking OCR API call
        // const response = await api('/expenses/ocr', { method: 'POST', body: JSON.stringify({ receiptData: form.receiptData }) });
        
        // Mock successful OCR result
        const mockOcrResult = {
            amount: 45.75,
            currency: 'EUR',
            category: 'Meal',
            description: 'Lunch with client at Le Bistro',
            date: new Date().toISOString().substring(0, 10)
        };
        
        setForm(f => ({ ...f, ...mockOcrResult }));
        setMessage('OCR successful! Review details and submit.');
        setMessageType('success');
        setSubmitting(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            const payload = {
                ...form,
                amount: parseFloat(form.amount) // Ensure amount is number
            };
            
            // This calls the backend endpoint: POST /api/expenses
            const response = await api('/expenses', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload) 
            });

            if (response.success) {
                setMessage(`Expense submitted! Status: ${response.data.status}`);
                setMessageType('success');
                // Reset form after success
                setForm({ amount: '', currency: 'USD', category: 'Travel', description: '', date: new Date().toISOString().substring(0, 10), receiptData: '' });
            } else {
                 throw new Error(response.message || 'Submission failed.');
            }
        } catch (error) {
            setMessage(error.message);
            setMessageType('error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card title="Submit New Expense" className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount and Currency */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount & Currency (Submitting in)</label>
                        <div className="mt-1 flex rounded-lg shadow-sm">
                            <input 
                                type="number" 
                                name="amount" 
                                placeholder="Amount"
                                value={form.amount} 
                                onChange={handleChange} 
                                required 
                                min="0.01"
                                step="0.01"
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <select 
                                name="currency"
                                value={form.currency} 
                                onChange={handleChange}
                                className="border border-gray-300 px-3 py-2 rounded-r-lg"
                            >
                                <option>USD</option><option>EUR</option><option>INR</option><option>GBP</option>
                            </select>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Company's default currency: **{companyCurrency}**</p>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select 
                            name="category"
                            value={form.category} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Date and Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input 
                        type="date" 
                        name="date"
                        value={form.date} 
                        onChange={handleChange} 
                        required 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea 
                        name="description"
                        value={form.description} 
                        onChange={handleChange} 
                        required 
                        rows="3"
                        placeholder="Briefly describe the expense (e.g., Round trip airfare to New York)"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                </div>
                
                {/* OCR Feature */}
                <div className="border p-4 rounded-xl bg-indigo-50 space-y-3">
                    <h3 className="text-md font-semibold text-indigo-700 flex items-center"><Zap className="w-5 h-5 mr-2"/> OCR Receipt Submission</h3>
                    <input 
                        type="file" 
                        name="receipt"
                        accept="image/*"
                        onChange={handleChange} 
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <Button 
                        type="button" 
                        onClick={handleOCR} 
                        disabled={submitting || !form.receiptData}
                        variant="secondary"
                        className="w-full"
                    >
                        {submitting ? 'Processing...' : 'Auto-Fill from Receipt'}
                    </Button>
                    {form.receiptData && <p className="text-xs text-green-600">Receipt loaded. Details ready for OCR processing.</p>}
                </div>

                <Button type="submit" className="w-full" disabled={submitting || !form.amount}>
                    {submitting ? 'Submitting...' : 'Final Submit Claim'}
                </Button>
            </form>
            <Notification message={message} type={messageType} />
        </Card>
    );
};

const ExpenseHistory = () => {
    const { api } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            // This calls the backend endpoint: GET /api/expenses/mine
            const response = await api('/expenses/mine', { method: 'GET' });
            // Mocking the data structure
            const mockExpenses = [
                { id: 1, category: 'Travel', description: 'Flight to SFO', amount: 450, currency: 'USD', convertedAmount: 450, status: 'Approved', approvals: [{ approver: 'Manager A', status: 'Approved' }] },
                { id: 2, category: 'Meal', description: 'Team lunch', amount: 8500, currency: 'INR', convertedAmount: 102, status: 'Pending', approvals: [{ approver: 'Manager B', status: 'Pending' }, { approver: 'Finance C', status: 'Pending' }] },
                { id: 3, category: 'Software', description: 'License renewal', amount: 150, currency: 'EUR', convertedAmount: 160, status: 'Rejected', approvals: [{ approver: 'Director D', status: 'Rejected', comment: 'Budget exceeded.' }] },
            ];
            setExpenses(mockExpenses);
            setLoading(false);
        };
        fetchExpenses();
    }, [api]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <p className="text-center">Loading expense history...</p>;

    return (
        <Card title="My Expense History">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Converted ({useAuth().companyCurrency})</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Steps</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.currency} {expense.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{useAuth().companyCurrency} {expense.convertedAmount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(expense.status)}`}>
                                        {expense.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {expense.approvals.map((a, i) => (
                                        <span key={i} className={`mr-2 text-xs block ${a.status === 'Pending' ? 'text-yellow-600' : a.status === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                                            Step {i + 1}: {a.approver} ({a.status})
                                        </span>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// --- Manager/Admin Views ---

const ExpensesForApproval = () => {
    const { api, companyCurrency } = useAuth();
    const [pendingExpenses, setPendingExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState({}); // { expenseId: 'approve'/'reject' }
    const [comment, setComment] = useState({}); // { expenseId: 'comment' }
    const [notification, setNotification] = useState('');

    const fetchPending = async () => {
        setLoading(true);
        // This calls the backend endpoint: GET /api/expenses/for-approval
        const response = await api('/expenses/for-approval', { method: 'GET' });
        // Mocking data where the logged-in user is the NEXT approver
        const mockPending = [
            { id: 101, employee: 'Jane Doe', category: 'Meal', description: 'Client Dinner', amount: 150, currency: 'USD', convertedAmount: 150, flowApplied: 'Default', status: 'Pending' },
            { id: 102, employee: 'John Smith', category: 'Travel', description: 'Train ticket', amount: 450, currency: 'EUR', convertedAmount: 485, flowApplied: 'High Value', status: 'Pending' },
        ];
        setPendingExpenses(mockPending);
        setLoading(false);
    };

    useEffect(() => {
        fetchPending();
    }, [api]);

    const handleAction = async (expenseId, finalAction) => {
        // This calls the backend endpoint: PUT /api/expenses/:id/action
        const response = await api(`/expenses/${expenseId}/action`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: finalAction, comment: comment[expenseId] || '' })
        });
        
        if (response.success) {
            setNotification(`Expense ${expenseId} ${finalAction}ed successfully.`);
            // Refetch or update local state
            fetchPending(); 
            setTimeout(() => setNotification(''), 3000);
        } else {
            setNotification('Approval action failed.');
        }
    };

    if (loading) return <p className="text-center">Loading requests for approval...</p>;

    return (
        <Card title="Expenses Awaiting Your Approval">
             <Notification message={notification} type="success" />
            {pendingExpenses.length === 0 ? (
                <p className="text-gray-500">No expenses currently require your approval. Great job!</p>
            ) : (
                <div className="space-y-6">
                    {pendingExpenses.map(expense => (
                        <div key={expense.id} className="border border-indigo-200 p-4 rounded-xl shadow-md bg-white">
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <p className="text-lg font-semibold text-gray-800">{expense.description}</p>
                                <p className="text-right text-lg font-bold text-indigo-700">
                                    {companyCurrency} {expense.convertedAmount.toFixed(2)}
                                </p>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">Submitted by: **{expense.employee}** | Category: {expense.category}</p>
                            
                            <div className="my-3 space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Comment (Optional)</label>
                                <textarea 
                                    rows="2"
                                    value={comment[expense.id] || ''}
                                    onChange={(e) => setComment({ ...comment, [expense.id]: e.target.value })}
                                    placeholder="Enter reason for approval/rejection"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 mt-4">
                                <Button 
                                    variant="danger" 
                                    onClick={() => handleAction(expense.id, 'reject')}
                                >
                                    Reject
                                </Button>
                                <Button 
                                    variant="success" 
                                    onClick={() => handleAction(expense.id, 'approve')}
                                >
                                    Approve
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};


// --- Admin Views ---

const AdminSettings = () => {
    // Mock user management state
    const [users, setUsers] = useState([
        { id: 1, name: 'Jane Admin', role: 'Admin', manager: null },
        { id: 2, name: 'Alex Manager', role: 'Manager', manager: 1 },
        { id: 3, name: 'Employee Z', role: 'Employee', manager: 2 },
    ]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Employee');
    const [managerId, setManagerId] = useState('');
    const { api } = useAuth();
    const [message, setMessage] = useState('');

    const managers = users.filter(u => u.role === 'Manager' || u.role === 'Admin');

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage('');

        // This calls the backend endpoint: POST /api/admin/users
        const response = await api('/admin/users', { 
            method: 'POST', 
            body: JSON.stringify({ name, email, password, role, managerId }) 
        });

        if (response.success) {
            setMessage(`User ${name} created successfully as ${role}.`);
            // Mock state update
            setUsers([...users, { id: Date.now(), name, role, manager: managerId }]);
            setName(''); setEmail(''); setPassword(''); setManagerId('');
        } else {
            setMessage('Error creating user.');
        }
    };
    
    // Placeholder for Approval Flow management (highly complex UI, simplifying for now)
    const ApprovalFlowManagement = () => (
        <Card title="Approval Flow Configuration (Admin)" className="mt-6">
            <p className="text-sm text-gray-600">
                Define multi-step sequential flows (Manager, Finance, Director) and conditional rules (e.g., 60% approval or CFO required).
            </p>
            <Button className="mt-4" variant="secondary">
                + Create New Flow
            </Button>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                **Mock Flow:** Expenses over $500 require: 1. Manager, then 2. Director.
            </div>
        </Card>
    );

    return (
        <div className="space-y-8">
            <ApprovalFlowManagement />

            <Card title="User Management (Create New User)">
                 {message && <p className="text-green-600 mb-3">{message}</p>}
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="p-3 border rounded-lg" />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="p-3 border rounded-lg" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="p-3 border rounded-lg" />
                    
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="p-3 border rounded-lg">
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                    </select>

                    <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className="p-3 border rounded-lg">
                        <option value="">-- Assign Manager (Optional) --</option>
                        {managers.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.name} ({m.role})
                            </option>
                        ))}
                    </select>
                    
                    <Button type="submit" className="md:col-span-2" icon={<UserPlus className="w-5 h-5" />}>
                        Create User
                    </Button>
                </form>

                <h3 className="text-lg font-semibold mt-6 mb-3 border-t pt-4">Current Users</h3>
                <ul className="space-y-2">
                    {users.map(u => (
                        <li key={u.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                            <span className="font-medium">{u.name}</span>
                            <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${u.role === 'Admin' ? 'bg-indigo-200 text-indigo-800' : u.role === 'Manager' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                                {u.role}
                            </span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};


// --- Main Application Layout ---

const AppContent = () => {
    const { user, role, logout } = useAuth();
    const [activePage, setActivePage] = useState('Dashboard');

    // Define navigation items based on user role
    const getNavItems = (userRole) => {
        const base = [
            { id: 'Dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5"/> },
        ];
        
        if (userRole === 'Employee') {
            return [...base, 
                { id: 'SubmitExpense', label: 'Submit Expense', icon: <DollarSign className="w-5 h-5"/> },
                { id: 'History', label: 'My History', icon: <FileText className="w-5 h-5"/> }
            ];
        } else if (userRole === 'Manager' || userRole === 'Admin') {
            return [...base, 
                { id: 'SubmitExpense', label: 'Submit Expense', icon: <DollarSign className="w-5 h-5"/> },
                { id: 'Approval', label: 'Approvals', icon: <Wallet className="w-5 h-5"/> },
            ];
        } 
        
        if (userRole === 'Admin') {
            return [...base, 
                { id: 'Approval', label: 'Approvals', icon: <Wallet className="w-5 h-5"/> },
                { id: 'AdminSettings', label: 'Admin Settings', icon: <Settings className="w-5 h-5"/> }
            ];
        }
        return base;
    };

    const navItems = getNavItems(role);

    const renderContent = () => {
        switch (activePage) {
            case 'SubmitExpense':
                return <ExpenseSubmissionForm />;
            case 'History':
                return <ExpenseHistory />;
            case 'Approval':
                return <ExpensesForApproval />;
            case 'AdminSettings':
                return <AdminSettings />;
            case 'Dashboard':
            default:
                return <DashboardView role={role} />;
        }
    };

    // Generic dashboard view
    const DashboardView = ({ role }) => (
        <Card title={`Welcome Back, ${user.name} (${role})`}>
            <p className="text-gray-600 mb-4">
                Your role is **{role}**. This is your central hub for managing expenses.
            </p>
            {role === 'Employee' && (
                <p>Use the **Submit Expense** tab to create new claims and **My History** to track status.</p>
            )}
            {(role === 'Manager' || role === 'Admin') && (
                 <p>You have access to the **Approvals** tab to review pending claims.</p>
            )}
        </Card>
    );

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-indigo-800 text-white flex flex-col shadow-2xl">
                <div className="p-6 text-2xl font-extrabold text-white border-b border-indigo-700">
                    Expense Manager
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            className={`flex items-center w-full p-3 rounded-xl transition-colors duration-150 ${
                                activePage === item.id 
                                    ? 'bg-indigo-700 font-bold shadow-lg' 
                                    : 'hover:bg-indigo-600/70'
                            }`}
                        >
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                        </button>
                    ))}
                </nav>
                {/* Logout */}
                <div className="p-4 border-t border-indigo-700">
                    <Button 
                        onClick={logout} 
                        variant="secondary" 
                        className="w-full bg-indigo-700 text-white hover:bg-red-600"
                        icon={<LogOut className="w-5 h-5"/>}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8">
                <header className="mb-8 flex justify-between items-center pb-4 border-b">
                    <h1 className="text-3xl font-bold text-gray-900">{activePage}</h1>
                    <div className="text-gray-600">
                        Logged in as **{user.name}**
                    </div>
                </header>
                {renderContent()}
            </main>
        </div>
    );
};


// --- Root Component ---

const App = () => {
    const { isAuthenticated } = useAuth();
    
    // We use a simple switch here for navigation between Login and Main App
    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={() => { /* State change handled by AuthProvider */ }} />;
    }

    return <AppContent />;
};

// Export the AuthProvider wrapper
export default () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);
