// src/pages/ManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Container, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, AppBar, Toolbar, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField 
} from '@mui/material';
import { fetchPendingApprovals, approveExpense, rejectExpense } from '../services/api';

// Define the sample data OUTSIDE the component
const sampleDataForManager = [
  { id: 3, owner: 'Chandan Kumar', description: 'Taxi to Airport', date: '2025-10-04', amount: '750 INR' },
  { id: 4, owner: 'Alex Ray', description: 'Team Dinner', date: '2025-10-05', amount: '4000 INR' },
];

function ManagerDashboard() {
  // Use the sample data as the INITIAL state. The incorrect 'if' block has been removed.
  const [pendingExpenses, setPendingExpenses] = useState(sampleDataForManager);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');

  useEffect(() => {
    const getPending = async () => {
      try {
        const { data } = await fetchPendingApprovals();
        setPendingExpenses(data);
      } catch (error) {
        console.error("Failed to fetch pending approvals", error);
      }
    };
    // getPending(); // Stays commented out until backend is ready
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveExpense(id);
      setPendingExpenses(pendingExpenses.filter((exp) => exp.id !== id));
      alert(`Expense #${id} approved!`);
    } catch (error) {
      console.error("Approval failed", error);
      alert("Approval failed! Check console.");
    }
  };

  const handleOpenRejectDialog = (id) => {
    setCurrentExpenseId(id);
    setRejectionDialogOpen(true);
  };

  const handleCloseRejectDialog = () => {
    setCurrentExpenseId(null);
    setRejectionComment('');
    setRejectionDialogOpen(false);
  };

  const handleConfirmReject = async () => {
    try {
      await rejectExpense(currentExpenseId, rejectionComment);
      setPendingExpenses(pendingExpenses.filter((exp) => exp.id !== currentExpenseId));
      alert(`Expense #${currentExpenseId} rejected!`);
    } catch (error) {
      console.error("Rejection failed", error);
      alert("Rejection failed! Check console.");
    }
    handleCloseRejectDialog();
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
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Approvals to Review
        </Typography>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Request Owner</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.owner}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell align="right">{expense.date}</TableCell>
                  <TableCell align="right">{expense.amount}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Button variant="contained" color="success" size="small" onClick={() => handleApprove(expense.id)}>Approve</Button>
                      <Button variant="contained" color="error" size="small" onClick={() => handleOpenRejectDialog(expense.id)}>Reject</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={rejectionDialogOpen} onClose={handleCloseRejectDialog}>
        <DialogTitle>Reason for Rejection</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Comment" type="text" fullWidth variant="standard" value={rejectionComment} onChange={(e) => setRejectionComment(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog}>Cancel</Button>
          <Button onClick={handleConfirmReject}>Submit Rejection</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ManagerDashboard;