// src/pages/ManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Container, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, CircularProgress,
  Snackbar, Alert, Grid, Card, CardContent
} from '@mui/material';
import { fetchPendingApprovals, approveExpense, rejectExpense } from '../services/api';
import { useAuth } from '../services/AuthContext';
import NavBar from '../components/NavBar';

function ManagerDashboard() {
  const { user } = useAuth();
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const getPending = async () => {
      try {
        setLoading(true);
        const { data } = await fetchPendingApprovals();
        console.log('Fetched pending approvals:', data); // Add this line to debug
        setPendingExpenses(data);
      } catch (error) {
        console.error("Failed to fetch pending approvals", error);
        setPendingExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    getPending();

    // Set up auto-refresh interval (every 10 seconds)
    const refreshInterval = setInterval(getPending, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []); // Empty dependency array to run only on mount

  const handleCloseRejectDialog = () => {
    setCurrentExpenseId(null);
    setRejectionComment('');
    setRejectionDialogOpen(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveExpense(id);
      setPendingExpenses((prev) => prev.filter((exp) => exp.id !== id));
      setSnackbarMessage(`Expense #${id} approved successfully!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Approval failed", error);
      setSnackbarMessage("Approval failed! " + (error.response?.data?.error || "Check console."));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectDialog = (id) => {
    setCurrentExpenseId(id);
    setRejectionDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    setActionLoading(currentExpenseId);
    try {
      await rejectExpense(currentExpenseId, { comment: rejectionComment });
      setPendingExpenses((prev) => prev.filter((exp) => exp.id !== currentExpenseId));
      setSnackbarMessage(`Expense #${currentExpenseId} rejected!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Rejection failed", error);
      setSnackbarMessage("Rejection failed! " + (error.response?.data?.error || "Check console."));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setActionLoading(null);
    }
    handleCloseRejectDialog();
  };

  // Calculate expense statistics
  const totalPending = pendingExpenses.length;
  const totalAmount = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageAmount = totalPending > 0 ? totalAmount / totalPending : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <NavBar />

      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
            Approvals to Review
          </Typography>

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
                    Pending Approvals
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {totalPending}
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
                    Total Amount
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    ₹ {totalAmount.toFixed(2)}
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
                    Average Amount
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    ₹ {averageAmount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Request Owner</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : pendingExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">No pending approvals.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingExpenses.map((expense) => (
                      <TableRow key={expense.id} hover>
                        <TableCell>{expense.employeeEmail}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell align="right">{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                        <TableCell align="right">{`${expense.currency} ${expense.amount}`}</TableCell>
                        <TableCell align="center">
                          {loading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleApprove(expense.id)}
                                disabled={actionLoading === expense.id}
                                sx={{ minWidth: '80px' }}
                              >
                                {actionLoading === expense.id ? (
                                  <CircularProgress size={20} color="inherit" />
                                ) : (
                                  "Approve"
                                )}
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => handleOpenRejectDialog(expense.id)}
                                disabled={actionLoading === expense.id}
                                sx={{ minWidth: '80px' }}
                              >
                                {actionLoading === expense.id ? (
                                  <CircularProgress size={20} color="inherit" />
                                ) : (
                                  "Reject"
                                )}
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>

      {/* Reject dialog */}
      <Dialog open={rejectionDialogOpen} onClose={handleCloseRejectDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Reason for Rejection</DialogTitle>
        <DialogContent>
          <TextField 
            autoFocus 
            margin="dense" 
            label="Comment" 
            type="text" 
            fullWidth 
            variant="outlined" 
            value={rejectionComment} 
            onChange={(e) => setRejectionComment(e.target.value)} 
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseRejectDialog} disabled={actionLoading === currentExpenseId}>Cancel</Button>
          <Button 
            onClick={handleConfirmReject} 
            disabled={actionLoading === currentExpenseId}
            variant="contained"
            color="error"
          >
            {actionLoading === currentExpenseId ? <CircularProgress size={20} color="inherit" /> : "Submit Rejection"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ marginTop: '64px' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%', boxShadow: 3 }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ManagerDashboard;