console.log("--- LOADING LATEST VERSION OF index.js ---");

// Import necessary libraries
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

// --- Basic Setup ---
const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10;
const JWT_SECRET = 'your-super-secret-key-for-hackathon'; // TODO: Move to an environment variable in production

// --- Middleware ---
app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

function authorizeAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
}

function authorizeManager(req, res, next) {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Managers or Admins only." });
    }
    next();
}

// --- Database Connection ---
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error("Error opening database", err.message);
    else {
        console.log("Connected to the SQLite database.");
        initializeDatabase();
    }
});

// --- Database Initialization ---
function initializeDatabase() {
    const createCompaniesTable = `
    CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        defaultCurrency TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );`;

    const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'employee')),
        companyId INTEGER,
        managerId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (companyId) REFERENCES companies (id),
        FOREIGN KEY (managerId) REFERENCES users (id)
    );`;

    const createExpensesTable = `
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submittedByUserId INTEGER NOT NULL,
        companyId INTEGER NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        category TEXT,
        description TEXT,
        expenseDate DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
        rejectionComment TEXT, -- New column added
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submittedByUserId) REFERENCES users (id),
        FOREIGN KEY (companyId) REFERENCES companies (id)
    );`;

    const createApprovalRulesTable = `
    CREATE TABLE IF NOT EXISTS approval_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        description TEXT NOT NULL,
        approvers TEXT NOT NULL, -- Storing as comma-separated emails or user IDs
        isSequenced INTEGER NOT NULL DEFAULT 0,
        isManagerFirst INTEGER NOT NULL DEFAULT 0,
        percentage REAL, -- Minimum approval percentage (e.g., 50 for 50%)
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (companyId) REFERENCES companies (id)
    );`;

    db.serialize(() => {
        db.run(createCompaniesTable, (err) => { if (!err) console.log("Companies table is ready."); });
        db.run(createUsersTable, (err) => { if (!err) console.log("Users table is ready."); });
        db.run(createExpensesTable, (err) => { if (!err) console.log("Expenses table is ready."); });
        db.run(createApprovalRulesTable, (err) => { if (!err) console.log("Approval Rules table is ready."); });
    });
}

// --- API Endpoints ---

// PUBLIC ROUTES
app.get('/', (req, res) => res.json({ message: "Welcome to the Expense Management API!" }));

app.post('/signup', async (req, res) => {
    const { companyName, country, email, password } = req.body;
    if (!companyName || !country || !email || !password) {
        return res.status(400).json({ error: "Missing required fields." });
    }
    try {
        const response = await fetch('https://restcountries.com/v3.1/name/' + country + '?fields=currencies');
        const data = await response.json();
        const currencyCode = Object.keys(data[0].currencies)[0];

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        db.run(`INSERT INTO companies (name, defaultCurrency) VALUES (?, ?)`, [companyName, currencyCode], function(err) {
            if (err) return res.status(500).json({ error: "Company name may already exist." });
            const companyId = this.lastID;
            db.run(`INSERT INTO users (email, password, role, companyId) VALUES (?, ?, 'admin', ?)`, [email, hashedPassword, companyId], function(err) {
                if (err) return res.status(500).json({ error: "User email may already exist." });
                res.status(201).json({ message: "Company and admin account created successfully!", userId: this.lastID, companyId: companyId });
            });
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to create company or user." });
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: "Invalid credentials." });
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            const token = jwt.sign({ userId: user.id, role: user.role, companyId: user.companyId }, JWT_SECRET, { expiresIn: '3h' });
            db.get(`SELECT defaultCurrency FROM companies WHERE id = ?`, [user.companyId], (err, company) => {
                if (err || !company) return res.status(500).json({ error: "Could not retrieve company currency." });
                res.json({ 
                    message: "Logged in successfully!", 
                    token,
                    userId: user.id,
                    role: user.role,
                    companyId: user.companyId,
                    defaultCurrency: company.defaultCurrency
                });
            });
        } else {
            res.status(401).json({ error: "Invalid credentials." });
        }
    });
});

// EMPLOYEE ROUTES
// Move CORS configuration before routes
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.post('/expenses', authenticateToken, (req, res) => {
    const { amount, currency, category, description, expenseDate } = req.body;
    const { userId, companyId } = req.user;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount. Must be a positive number." });
    }

    // Validate currency
    if (!currency || typeof currency !== 'string' || currency.length !== 3) {
        return res.status(400).json({ error: "Invalid currency code." });
    }

    // Validate date
    if (!expenseDate || isNaN(new Date(expenseDate).getTime())) {
        return res.status(400).json({ error: "Invalid expense date." });
    }

    const sql = `INSERT INTO expenses (submittedByUserId, companyId, amount, currency, category, description, expenseDate) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [userId, companyId, amount, currency, category, description, expenseDate], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: "Failed to submit expense." });
        }
        res.status(201).json({ 
            message: "Expense submitted successfully!", 
            expenseId: this.lastID 
        });
    });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.get('/expenses/me', authenticateToken, (req, res) => {
    const { userId } = req.user;
    db.all(`SELECT * FROM expenses WHERE submittedByUserId = ? ORDER BY createdAt DESC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Failed to retrieve expenses." });
        res.json(rows);
    });
});

// ADMIN ROUTES
app.post('/users', authenticateToken, authorizeAdmin, async (req, res) => {
    const { email, password, role, managerId } = req.body;
    const { companyId } = req.user;
    if (!email || !password || !role) return res.status(400).json({ error: "Missing required fields." });
    if (role !== 'employee' && role !== 'manager') return res.status(400).json({ error: "Invalid role." });
    if (role === 'employee' && !managerId) return res.status(400).json({ error: "An employee must be assigned a managerId." });

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = `INSERT INTO users (email, password, role, companyId, managerId) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [email, hashedPassword, role, companyId, managerId || null], function(err) {
            if (err) return res.status(500).json({ error: "Failed to create user. Email may already be in use." });
            res.status(201).json({ message: `User with role '${role}' created successfully!`, userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: "An unexpected error occurred." });
    }
});

app.get('/users', authenticateToken, authorizeAdmin, (req, res) => {
    const { companyId } = req.user;
    db.all(`SELECT id, email, role, managerId FROM users WHERE companyId = ?`, [companyId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Failed to retrieve users." });
        res.json(rows);
    });
});

// APPROVAL RULES ROUTES (Admin Only)
app.post('/approval-rules', authenticateToken, authorizeAdmin, (req, res) => {
    const { description, approvers, isSequenced, isManagerFirst, percentage } = req.body;
    const { companyId } = req.user;

    if (!description || !approvers) {
        return res.status(400).json({ error: "Description and approvers are required." });
    }

    // Convert boolean to integer for SQLite
    const sequenced = isSequenced ? 1 : 0;
    const managerFirst = isManagerFirst ? 1 : 0;
    
    const sql = `INSERT INTO approval_rules (companyId, description, approvers, isSequenced, isManagerFirst, percentage) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [companyId, description, approvers.join(','), sequenced, managerFirst, percentage || null], function(err) {
        if (err) return res.status(500).json({ error: "Failed to create approval rule." });
        res.status(201).json({ message: "Approval rule created successfully!", ruleId: this.lastID });
    });
});

app.get('/approval-rules', authenticateToken, authorizeAdmin, (req, res) => {
    const { companyId } = req.user;
    db.all(`SELECT * FROM approval_rules WHERE companyId = ? ORDER BY createdAt DESC`, [companyId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Failed to retrieve approval rules." });
        // Convert integer back to boolean for frontend
        const rules = rows.map(row => ({
            ...row,
            isSequenced: row.isSequenced === 1,
            isManagerFirst: row.isManagerFirst === 1
        }));
        res.json(rules);
    });
});

app.put('/approval-rules/:id', authenticateToken, authorizeAdmin, (req, res) => {
    const ruleId = req.params.id;
    const { description, approvers, isSequenced, isManagerFirst, percentage } = req.body;
    const { companyId } = req.user;

    if (!description || !approvers) {
        return res.status(400).json({ error: "Description and approvers are required." });
    }

    const sequenced = isSequenced ? 1 : 0;
    const managerFirst = isManagerFirst ? 1 : 0;

    const sql = `UPDATE approval_rules SET description = ?, approvers = ?, isSequenced = ?, isManagerFirst = ?, percentage = ? WHERE id = ? AND companyId = ?`;
    db.run(sql, [description, approvers.join(','), sequenced, managerFirst, percentage || null, ruleId, companyId], function(err) {
        if (err) return res.status(500).json({ error: "Failed to update approval rule." });
        if (this.changes === 0) return res.status(404).json({ error: "Approval rule not found or not authorized." });
        res.json({ message: "Approval rule updated successfully!" });
    });
});

app.delete('/approval-rules/:id', authenticateToken, authorizeAdmin, (req, res) => {
    const ruleId = req.params.id;
    const { companyId } = req.user;

    const sql = `DELETE FROM approval_rules WHERE id = ? AND companyId = ?`;
    db.run(sql, [ruleId, companyId], function(err) {
        if (err) return res.status(500).json({ error: "Failed to delete approval rule." });
        if (this.changes === 0) return res.status(404).json({ error: "Approval rule not found or not authorized." });
        res.json({ message: "Approval rule deleted successfully!" });
    });
});

// MANAGER ROUTES
app.get('/team/expenses', authenticateToken, authorizeManager, (req, res) => {
    const managerId = req.user.userId;
    const sql = `SELECT e.*, u.email as employeeEmail FROM expenses e JOIN users u ON e.submittedByUserId = u.id WHERE e.submittedByUserId IN (SELECT id FROM users WHERE managerId = ?) ORDER BY e.createdAt DESC`;
    db.all(sql, [managerId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Failed to retrieve team expenses." });
        res.json(rows);
    });
});

app.post('/expenses/:id/approve', authenticateToken, authorizeManager, (req, res) => {
    const expenseId = req.params.id;
    const sql = `UPDATE expenses SET status = 'approved' WHERE id = ?`;
    db.run(sql, [expenseId], function(err) {
        if (err) return res.status(500).json({ error: "Failed to approve expense." });
        if (this.changes === 0) return res.status(404).json({ error: "Expense not found." });
        res.json({ message: "Expense approved successfully." });
    });
});

app.post('/expenses/:id/reject', authenticateToken, authorizeManager, (req, res) => {
    const expenseId = req.params.id;
    const { comment } = req.body;
    const sql = `UPDATE expenses SET status = 'rejected', rejectionComment = ? WHERE id = ?`;
    db.run(sql, [comment, expenseId], function(err) {
        if (err) return res.status(500).json({ error: "Failed to reject expense." });
        if (this.changes === 0) return res.status(404).json({ error: "Expense not found." });
        res.json({ message: "Expense rejected successfully." });
    });
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

