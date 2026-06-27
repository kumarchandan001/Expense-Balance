// src/pages/EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl,
  Snackbar, Alert, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import { createExpense, fetchExpenses } from '../services/api';
import { useAuth } from '../services/AuthContext';
import NavBar from '../components/NavBar';

function EmployeeDashboard() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(user?.defaultCurrency || 'INR');
  const [category, setCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [amountError, setAmountError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const validateAmount = (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return "Amount must be a positive number.";
    }
    return "";
  };

  useEffect(() => {
    const getExpenses = async () => {
      try {
        setLoading(true);
        const { data } = await fetchExpenses();
        setExpenses(data);
        console.log('Fetched expenses:', data); // Add this line to debug
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };
    getExpenses();
  }, []);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setDescription('');
    setAmount('');
    setCurrency(user?.defaultCurrency || 'INR');
    setCategory('');
    setExpenseDate('');
    setAmountError('');
    setOpen(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleSubmitExpense = async () => {
    const amountValidation = validateAmount(amount);
    if (amountValidation) {
      setSnackbarMessage(amountValidation);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    const newExpense = { 
      description, 
      amount: parseFloat(amount), 
      currency, 
      category, 
      expenseDate 
    };
    
    try {
      setSubmitLoading(true);
      await createExpense(newExpense);
      // Refresh expenses
      const { data: updatedExpenses } = await fetchExpenses();
      setExpenses(updatedExpenses);
      setSnackbarMessage("Expense Submitted Successfully!");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleClose();
    } catch (error) {
      console.error("Error submitting expense:", error);
      setSnackbarMessage("Submission Failed! " + (error.response?.data?.error || "Check the console."));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Calculate expense statistics
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses.filter(exp => exp.status === 'pending');
  const approvedExpenses = expenses.filter(exp => exp.status === 'approved');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <NavBar />

      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              My Expenses
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleOpen}
            >
              Submit a New Expense
            </Button>
          </Box>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                background: 'linear-gradient(135deg, #bbdefb 0%, #e3f2fd 100%)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Total Expenses
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {currency} {totalExpenses.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                background: 'linear-gradient(135deg, #ffecb3 0%, #fff8e1 100%)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Pending
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {pendingExpenses.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                background: 'linear-gradient(135deg, #c8e6c9 0%, #e8f5e9 100%)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Approved
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {approvedExpenses.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Expense Submission Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Submit New Expense</DialogTitle>
        <DialogContent>
          <TextField 
            autoFocus 
            margin="dense" 
            label="Description" 
            type="text" 
            fullWidth 
            variant="outlined" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField 
            margin="dense" 
            label="Amount" 
            type="number" 
            fullWidth 
            variant="outlined" 
            value={amount} 
            onChange={(e) => { setAmount(e.target.value); setAmountError(''); }} 
            onBlur={(e) => setAmountError(validateAmount(e.target.value))} 
            error={!!amountError} 
            helperText={amountError} 
            sx={{ mb: 2 }}
          />
          <TextField 
            margin="dense" 
            label="Date" 
            type="date" 
            fullWidth 
            variant="outlined" 
            InputLabelProps={{ shrink: true }} 
            value={expenseDate} 
            onChange={(e) => setExpenseDate(e.target.value)} 
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <MenuItem value={"Food"}>Food</MenuItem>
              <MenuItem value={"Travel"}>Travel</MenuItem>
              <MenuItem value={"Supplies"}>Supplies</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={submitLoading}>Cancel</Button>
          <Button 
            onClick={handleSubmitExpense} 
            disabled={submitLoading}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
              }
            }}
          >
            {submitLoading ? <CircularProgress size={24} /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Expenses Table */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2, mt: 4 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Comments</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">No expenses found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id} hover>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell align="right">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      {`${expense.currency} ${expense.amount}`}
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        sx={{
                          color: expense.status === 'approved' ? 'success.main' :
                                     expense.status === 'rejected' ? 'error.main' : 'warning.main',
                          fontWeight: 600
                        }}
                      >
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {expense.rejectionComment && (
                        <Typography color="error.main" variant="body2">
                          {expense.rejectionComment}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default EmployeeDashboard;
