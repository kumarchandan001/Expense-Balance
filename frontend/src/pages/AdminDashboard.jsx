// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Snackbar, Alert, Chip, Card, CardContent, Grid
} from '@mui/material';
import { createUser, fetchUsers } from '../services/api';
import { useAuth } from '../services/AuthContext';
import NavBar from '../components/NavBar';

function AdminDashboard() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('employee');
  const [managerId, setManagerId] = useState('');
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true);
        const { data } = await fetchUsers();
        setUsers(data);
        setManagers(data.filter(user => user.role === 'manager'));
      } catch (error) {
        console.error("Failed to fetch users", error);
        setError(error.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  const handleClickOpen = () => { setOpen(true); };
  
  const handleClose = () => { 
    setNewEmail('');
    setNewPassword('');
    setNewRole('employee');
    setManagerId('');
    setPasswordError('');
    setError(null);
    setOpen(false); 
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pwd)) return "Password must contain at least one special character.";
    return "";
  };

  const handleCreateUser = async () => {
    const pwdValidation = validatePassword(newPassword);
    if (pwdValidation) {
      setPasswordError(pwdValidation);
      return;
    }
    
    try {
      setCreateUserLoading(true);
      setError(null);
      const userData = { 
        email: newEmail, 
        password: newPassword, 
        role: newRole, 
        managerId: newRole === 'employee' ? managerId : null 
      };
      const { data } = await createUser(userData);
      const { data: updatedUsers } = await fetchUsers();
      setUsers(updatedUsers);
      setManagers(updatedUsers.filter(user => user.role === 'manager'));
      setSnackbarMessage("User Created Successfully!");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleClose();
    } catch (error) {
      console.error("User creation failed:", error);
      setSnackbarMessage("Creation Failed! " + (error.response?.data?.error || "Check the console."));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setCreateUserLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <NavBar />
      
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Manage users and their roles
          </Typography>
        </Container>

        <Container maxWidth="lg" sx={{ mb: 4 }}>
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
                    Total Users
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {users.length}
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
                    Managers
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {managers.length}
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
                    Employees
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {users.filter(user => user.role === 'employee').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <Paper elevation={3} sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                User Management
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleClickOpen}
                sx={{ 
                  fontWeight: 500,
                  background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                  }
                }}
              >
                Create New User
              </Button>
            </Box>
    
            <TableContainer sx={{ 
              borderRadius: 2,
              '& .MuiTableRow-root:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}>
              <Table sx={{ minWidth: 650 }} aria-label="user table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">No users found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            color={user.role === 'admin' ? 'primary' : user.role === 'manager' ? 'secondary' : 'default'}
                            size="small"
                            sx={{ 
                              fontWeight: 500,
                              borderRadius: '16px',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {user.managerId ? (managers.find(m => m.id === user.managerId)?.email || 'N/A') : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          {newRole === 'employee' && (
            <FormControl fullWidth margin="dense" variant="outlined">
              <InputLabel>Manager</InputLabel>
              <Select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                label="Manager"
              >
                {managers.map((manager) => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={createUserLoading}>Cancel</Button>
          <Button 
            onClick={handleCreateUser} 
            disabled={createUserLoading}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
              }
            }}
          >
            {createUserLoading ? <CircularProgress size={24} /> : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminDashboard;
