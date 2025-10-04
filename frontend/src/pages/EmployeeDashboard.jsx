// src/pages/EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, AppBar, Toolbar, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl, Chip
} from '@mui/material';
import { createExpense, fetchExpenses } from '../services/api';

function EmployeeDashboard() {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const getExpenses = async () => {
      try {
        const { data } = await fetchExpenses();
        setExpenses(data);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
        // Set sample data if API fails, so the UI isn't empty
        setExpenses([
          { id: 1, description: 'Client Lunch Meeting', date: '2025-10-03', amount: '5000 INR', status: 'Approved' },
          { id: 2, description: 'Office Stationery', date: '2025-10-02', amount: '1500 INR', status: 'Rejected' },
          { id: 3, description: 'Taxi to Airport', date: '2025-10-04', amount: '750 INR', status: 'Pending' },
        ]);
      }
    };
    getExpenses();
  }, []);

  const handleClickOpen = () => { setOpen(true); };

  const handleClose = () => {
    setDescription('');
    setAmount('');
    setDate('');
    setCategory('');
    setOpen(false);
  };

  const handleSubmitExpense = async () => {
    const newExpense = { description, amount, date, category };
    try {
      const { data } = await createExpense(newExpense);
      setExpenses([...expenses, data]);
      alert("Expense Submitted!");
    } catch (error) {
      console.error("Error submitting expense:", error);
      alert("Submission Failed! Check the console.");
    }
    handleClose();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Expense Management
          </Typography>
          <Button color="inherit">Logout</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            My Expenses
          </Typography>
          <Button variant="contained" size="large" onClick={handleClickOpen}>
            Submit a New Expense
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="expense table">
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell align="right">Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell component="th" scope="row">{expense.description}</TableCell>
                  <TableCell align="right">{expense.date}</TableCell>
                  <TableCell align="right">{expense.amount}</TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={expense.status} 
                      color={
                        expense.status === 'Approved' ? 'success' :
                        expense.status === 'Rejected' ? 'error' :
                        'warning'
                      }
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Submit New Expense</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Description" type="text" fullWidth variant="standard" value={description} onChange={(e) => setDescription(e.target.value)} />
          <TextField margin="dense" label="Amount" type="number" fullWidth variant="standard" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <TextField margin="dense" label="Date" type="date" fullWidth variant="standard" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} />
          <FormControl fullWidth margin="dense" variant="standard">
            <InputLabel>Category</InputLabel>
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <MenuItem value={"Food"}>Food</MenuItem>
              <MenuItem value={"Travel"}>Travel</MenuItem>
              <MenuItem value={"Supplies"}>Supplies</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmitExpense}>Submit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EmployeeDashboard;