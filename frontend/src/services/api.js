// src/services/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// === Auth Routes ===
export const loginUser = (formData) => API.post('/users/login', formData);
export const signupUser = (formData) => API.post('/users/signup', formData);

// === Employee Routes ===
export const fetchExpenses = () => API.get('/expenses');
export const createExpense = (newExpense) => API.post('/expenses', newExpense);

// === Manager Routes ===
export const fetchPendingApprovals = () => API.get('/manager/approvals');
export const approveExpense = (id) => API.put(`/expenses/${id}/approve`);
export const rejectExpense = (id, comment) => API.put(`/expenses/${id}/reject`, { comment });

// === Admin Routes ===
export const createUser = (userData) => API.post('/admin/users', userData);