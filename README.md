# 💰 FinFlow — Smart Expense & Budget Management System

A full-stack personal finance web app built with **Node.js + Express** (backend) and **React** (frontend).

---

## 🚀 How to Run in VS Code

### Prerequisites
- **Node.js** v16+ installed → [nodejs.org](https://nodejs.org)
- **VS Code** installed

---

### Step 1 — Open in VS Code
Open the `expense-app` folder in VS Code.

### Step 2 — Open the Integrated Terminal
Press `` Ctrl+` `` (backtick) to open the terminal.

### Step 3 — Install All Dependencies
```bash
npm run install-all
```
This installs dependencies for both the root, server, and client.

### Step 4 — Start the App
```bash
npm run dev
```

This starts both:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:3000`

Your browser will auto-open to `http://localhost:3000` 🎉

---

## 📁 Project Structure

```
expense-app/
├── package.json            ← Root scripts (run both together)
├── server/
│   ├── package.json
│   └── index.js            ← Express API server (port 5000)
└── client/
    ├── package.json
    └── src/
        ├── App.js
        ├── index.css
        ├── context/
        │   └── AppContext.js
        ├── components/
        │   ├── Sidebar.js
        │   ├── Topbar.js
        │   ├── ExpenseModal.js
        │   └── CategoryBadge.js
        └── pages/
            ├── Dashboard.js
            ├── Expenses.js
            ├── Budget.js
            ├── Goals.js
            ├── Recurring.js
            └── Analytics.js
```

---

## ✨ Features

- **Dashboard** — Overview with charts, stats, alerts, goals snapshot
- **Expenses** — Add/edit/delete with category, tags, date, search & filter
- **Budget Manager** — Set monthly + per-category budgets with live tracking
- **Savings Goals** — Track financial milestones with progress bars
- **Recurring Expenses** — Manage subscriptions & bills (weekly/monthly/quarterly/yearly)
- **Analytics** — Deep charts: radar, area, bar, pie, 6-month trend
- **CSV Export** — Download all expenses as CSV

---

## 🛑 Stopping the App

Press `Ctrl+C` in the terminal.
