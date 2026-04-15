import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = "https://smart-expense-budget-management-system.onrender.com";

const AppContext = createContext();

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Education', 'Travel', 'Other'];
const CAT_COLORS = {
  Food: '#fbbf24', Transport: '#60a5fa', Rent: '#f87171',
  Entertainment: '#a78bfa', Shopping: '#f472b6', Health: '#34d399',
  Utilities: '#22d3ee', Education: '#fb923c', Travel: '#a3e635', Other: '#94a3b8'
};

// Helper: get auth headers using token from localStorage
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export function AppProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [budgets, setBudgets] = useState({ monthly: 15000, categories: {} });
  const [goals, setGoals] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterCategory, setFilterCategory] = useState('All');
  const [search, setSearch] = useState('');

  const fetchExpenses = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/expenses`, {
        params: { month: filterMonth, year: filterYear, category: filterCategory, search },
        ...authHeaders()
      });
      setExpenses(data);
    } catch { toast.error('Failed to load expenses'); }
  }, [filterMonth, filterYear, filterCategory, search]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/analytics`, {
        params: { month: filterMonth, year: filterYear },
        ...authHeaders()
      });
      setAnalytics(data);
    } catch { console.error('Analytics fetch failed'); }
  }, [filterMonth, filterYear]);

  const fetchBudgets = async () => {
    try {
      const { data } = await axios.get(`${API}/api/budgets`, { ...authHeaders() });
      setBudgets(data);
    } catch {}
  };

  const fetchGoals = async () => {
    try {
      const { data } = await axios.get(`${API}/api/goals`, { ...authHeaders() });
      setGoals(data);
    } catch {}
  };

  const fetchRecurring = async () => {
    try {
      const { data } = await axios.get(`${API}/api/recurring`, { ...authHeaders() });
      setRecurring(data);
    } catch {}
  };

  const fetchSummary = async () => {
    try {
      const { data } = await axios.get(`${API}/api/summary`, { ...authHeaders() });
      setSummary(data);
    } catch {}
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchExpenses(), fetchAnalytics(), fetchBudgets(), fetchGoals(), fetchRecurring(), fetchSummary()]);
    setLoading(false);
  }, [fetchExpenses, fetchAnalytics]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addExpense = async (data) => {
    try {
      await axios.post(`${API}/api/expenses`, data, { ...authHeaders() });
      toast.success('Expense added!');
      await fetchExpenses();
      await fetchAnalytics();
      await fetchSummary();
      return true;
    } catch { toast.error('Failed to add expense'); return false; }
  };

  const updateExpense = async (id, data) => {
    try {
      await axios.put(`${API}/api/expenses/${id}`, data, { ...authHeaders() });
      toast.success('Expense updated!');
      await fetchExpenses();
      await fetchAnalytics();
      return true;
    } catch { toast.error('Failed to update expense'); return false; }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${API}/api/expenses/${id}`, { ...authHeaders() });
      toast.success('Expense deleted');
      await fetchExpenses();
      await fetchAnalytics();
      return true;
    } catch { toast.error('Failed to delete expense'); return false; }
  };

  const updateBudgets = async (data) => {
    try {
      const { data: updated } = await axios.put(`${API}/api/budgets`, data, { ...authHeaders() });
      setBudgets(updated);
      toast.success('Budget updated!');
      await fetchAnalytics();
      return true;
    } catch { toast.error('Failed to update budget'); return false; }
  };

  const addGoal = async (data) => {
    try {
      await axios.post(`${API}/api/goals`, data, { ...authHeaders() });
      await fetchGoals();
      toast.success('Savings goal created!');
      return true;
    } catch { toast.error('Failed to create goal'); return false; }
  };

  const updateGoal = async (id, data) => {
    try {
      await axios.put(`${API}/api/goals/${id}`, data, { ...authHeaders() });
      await fetchGoals();
      toast.success('Goal updated!');
      return true;
    } catch { toast.error('Failed to update goal'); return false; }
  };

  const deleteGoal = async (id) => {
    try {
      await axios.delete(`${API}/api/goals/${id}`, { ...authHeaders() });
      await fetchGoals();
      toast.success('Goal removed');
    } catch { toast.error('Failed to remove goal'); }
  };

  const addRecurring = async (data) => {
    try {
      await axios.post(`${API}/api/recurring`, data, { ...authHeaders() });
      await fetchRecurring();
      toast.success('Recurring expense added!');
      return true;
    } catch { toast.error('Failed to add recurring expense'); return false; }
  };

  const deleteRecurring = async (id) => {
    try {
      await axios.delete(`${API}/api/recurring/${id}`, { ...authHeaders() });
      await fetchRecurring();
      toast.success('Recurring expense removed');
    } catch {}
  };

  const exportCSV = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/export/csv?token=${token}`, '_blank');
    toast.success('Downloading CSV...');
  };

  return (
    <AppContext.Provider value={{
      expenses, analytics, budgets, goals, recurring, summary, loading,
      activePage, setActivePage,
      filterMonth, setFilterMonth,
      filterYear, setFilterYear,
      filterCategory, setFilterCategory,
      search, setSearch,
      addExpense, updateExpense, deleteExpense,
      updateBudgets,
      addGoal, updateGoal, deleteGoal,
      addRecurring, deleteRecurring,
      exportCSV,
      refetch: fetchAll,
      CATEGORIES, CAT_COLORS
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
