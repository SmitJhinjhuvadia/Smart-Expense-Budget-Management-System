const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── CONNECT TO MONGODB ──────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, { family: 4 })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ─── MODELS ──────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, default: '' },
  tags: { type: [String], default: [] },
}, { timestamps: true });

const Expense = mongoose.model('Expense', ExpenseSchema);

const BudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  monthly: { type: Number, default: 15000 },
  categories: {
    type: Map,
    of: Number,
    default: {
      Food: 3000, Transport: 2000, Rent: 5000, Entertainment: 1000,
      Shopping: 2000, Health: 1500, Utilities: 1500, Education: 2000,
      Travel: 3000, Other: 1000
    }
  }
}, { timestamps: true });

const Budget = mongoose.model('Budget', BudgetSchema);

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  deadline: { type: String },
  color: { type: String, default: '#6366f1' },
}, { timestamps: true });

const Goal = mongoose.model('Goal', GoalSchema);

const RecurringSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  frequency: { type: String, default: 'monthly' },
  nextDue: { type: String },
}, { timestamps: true });

const Recurring = mongoose.model('Recurring', RecurringSchema);

// ─── AUTH MIDDLEWARE ─────────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token, access denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ─── AUTH ROUTES ─────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    // Create default budget for new user
    await Budget.create({ userId: user._id });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EXPENSES ────────────────────────────────────────────────────
app.get('/api/expenses', auth, async (req, res) => {
  try {
    const { month, year, category, search } = req.query;
    let query = { userId: req.userId };

    if (category && category !== 'All') query.category = category;
    if (search) query.description = { $regex: search, $options: 'i' };

    let expenses = await Expense.find(query).sort({ date: -1 });

    if (month && year) {
      expenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year);
      });
    }

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', auth, async (req, res) => {
  try {
    const { amount, category, date, description, tags } = req.body;
    if (!amount || !category || !date)
      return res.status(400).json({ error: 'Amount, category, and date are required' });

    const expense = await Expense.create({
      userId: req.userId,
      amount: parseFloat(amount),
      category, date,
      description: description || '',
      tags: tags || []
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/expenses/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ANALYTICS ───────────────────────────────────────────────────
app.get('/api/analytics', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const allExpenses = await Expense.find({ userId: req.userId });
    const monthly = allExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === m && d.getFullYear() === y;
    });

    const budget = await Budget.findOne({ userId: req.userId });
    const monthlyBudget = budget?.monthly || 15000;
    const categoryBudgets = budget?.categories ? Object.fromEntries(budget.categories) : {};

    const totalExpenses = monthly.reduce((s, e) => s + e.amount, 0);
    const remaining = monthlyBudget - totalExpenses;
    const percentUsed = Math.round((totalExpenses / monthlyBudget) * 100);

    const byCategory = {};
    monthly.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });

    const dailyMap = {};
    monthly.forEach(e => { dailyMap[e.date] = (dailyMap[e.date] || 0) + e.amount; });
    const dailyTrend = Object.entries(dailyMap).map(([date, amount]) => ({ date, amount })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const weeklyMap = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };
    monthly.forEach(e => {
      const day = new Date(e.date).getDate();
      if (day <= 7) weeklyMap['Week 1'] += e.amount;
      else if (day <= 14) weeklyMap['Week 2'] += e.amount;
      else if (day <= 21) weeklyMap['Week 3'] += e.amount;
      else weeklyMap['Week 4'] += e.amount;
    });
    const weeklyTrend = Object.entries(weeklyMap).map(([week, amount]) => ({ week, amount }));

    const topCategories = Object.entries(byCategory)
      .map(([cat, amt]) => ({ category: cat, amount: amt, budget: categoryBudgets[cat] || 0, percent: Math.round((amt / totalExpenses) * 100) }))
      .sort((a, b) => b.amount - a.amount);

    const categoryStatus = Object.entries(categoryBudgets).map(([cat, budget]) => ({
      category: cat, budget,
      spent: byCategory[cat] || 0,
      remaining: budget - (byCategory[cat] || 0),
      percentUsed: Math.round(((byCategory[cat] || 0) / budget) * 100)
    }));

    res.json({
      totalExpenses, totalBudget: monthlyBudget, remaining, percentUsed,
      transactionCount: monthly.length,
      avgDaily: monthly.length ? Math.round(totalExpenses / new Date(y, m, 0).getDate()) : 0,
      byCategory, topCategories, categoryStatus, dailyTrend, weeklyTrend
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BUDGETS ─────────────────────────────────────────────────────
app.get('/api/budgets', auth, async (req, res) => {
  try {
    let budget = await Budget.findOne({ userId: req.userId });
    if (!budget) budget = await Budget.create({ userId: req.userId });
    res.json({ monthly: budget.monthly, categories: Object.fromEntries(budget.categories) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/budgets', auth, async (req, res) => {
  try {
    const { monthly, categories } = req.body;
    let budget = await Budget.findOne({ userId: req.userId });
    if (!budget) budget = new Budget({ userId: req.userId });

    if (monthly) budget.monthly = parseFloat(monthly);
    if (categories) {
      categories && Object.entries(categories).forEach(([k, v]) => budget.categories.set(k, v));
    }
    await budget.save();
    res.json({ monthly: budget.monthly, categories: Object.fromEntries(budget.categories) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SAVINGS GOALS ───────────────────────────────────────────────
app.get('/api/goals', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/goals', auth, async (req, res) => {
  try {
    const goal = await Goal.create({ userId: req.userId, ...req.body });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/goals/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body, { new: true }
    );
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/goals/:id', auth, async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── RECURRING ───────────────────────────────────────────────────
app.get('/api/recurring', auth, async (req, res) => {
  try {
    const recurring = await Recurring.find({ userId: req.userId });
    res.json(recurring);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recurring', auth, async (req, res) => {
  try {
    const rec = await Recurring.create({ userId: req.userId, ...req.body });
    res.status(201).json(rec);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/recurring/:id', auth, async (req, res) => {
  try {
    await Recurring.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EXPORT ──────────────────────────────────────────────────────
app.get('/api/export/csv', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
    const headers = 'ID,Amount,Category,Date,Description,Tags\n';
    const rows = expenses.map(e =>
      `${e._id},${e.amount},${e.category},${e.date},"${e.description}","${(e.tags || []).join(';')}"`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.send(headers + rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/summary', auth, async (req, res) => {
  try {
    const now = new Date();
    const expenses = await Expense.find({ userId: req.userId });
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const total = expenses
        .filter(e => { const ed = new Date(e.date); return ed.getMonth() + 1 === m && ed.getFullYear() === y; })
        .reduce((s, e) => s + e.amount, 0);
      last6Months.push({ month: d.toLocaleString('default', { month: 'short' }), year: y, total });
    }
    res.json({ last6Months });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
