// src/services/api.js
import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({ baseURL: 'http://localhost:3000' }); // Ensure port matches backend

// Add token to requests if available
API.interceptors.request.use((config) => {
  const userProfile = localStorage.getItem('userProfile');
  if (userProfile) {
    const { token } = JSON.parse(userProfile);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// === Auth Routes ===
export const loginUser = (formData) => API.post('/login', formData);
export const signupUser = (formData) => API.post('/signup', formData);

// === Employee Routes ===
export const fetchExpenses = () => API.get('/expenses/me');
export const createExpense = (newExpense) => API.post('/expenses', newExpense);

// === Manager Routes ===
export const fetchPendingApprovals = () => API.get('/team/expenses');
export const approveExpense = (id) => API.post(`/expenses/${id}/approve`);
export const rejectExpense = (id) => API.post(`/expenses/${id}/reject`);

// === Admin Routes ===
export const fetchUsers = () => API.get('/users');
export const createUser = (userData) => API.post('/users', userData);

// === Approval Rules Routes ===
export const createApprovalRule = (ruleData) => API.post('/approval-rules', ruleData);
export const fetchApprovalRules = () => API.get('/approval-rules');
export const updateApprovalRule = (id, ruleData) => API.put(`/approval-rules/${id}`, ruleData);
export const deleteApprovalRule = (id) => API.delete(`/approval-rules/${id}`);

// === Public Data Routes ===
export const fetchCountries = () => API.get('https://restcountries.com/v3.1/all?fields=name');