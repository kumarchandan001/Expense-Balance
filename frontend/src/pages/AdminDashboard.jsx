// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import {
  Box, Button, Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, AppBar, Toolbar, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { createUser } from '../services/api';
import { Link as RouterLink } from 'react-router-dom';

const users = [
  { id: 1, name: 'Marc', role: 'Manager', manager: 'Sarah', email: 'marc@gmail.com' },
  { id: 2, name: 'Chandan', role: 'Employee', manager: 'Marc', email: 'chandan@example.com' },
  { id: 3, name: 'Alex', role: 'Employee', manager: 'Marc', email: 'alex@example.com' },
];

function AdminDashboard() {
  const [open, setOpen] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Employee');
  const [assignedManager, setAssignedManager] = useState('');

  const handleClickOpen = () => { setOpen(true); };
  
  const handleClose = () => { 
    setNewName('');
    setNewEmail('');
    setNewRole('Employee');
    setAssignedManager('');
    setOpen(false); 
  };

  const handleCreateUser = async () => {
    const userData = { name: newName, email: newEmail, role: newRole, manager: assignedManager };
    try {
      const response = await createUser(userData);
      console.log("User created:", response.data);
      alert("User Created Successfully!");
    } catch (error) {
      console.error("User creation failed:", error);
      alert("Creation Failed! Check the console.");
    }
    handleClose();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Expense Management - Admin
          </Typography>
          <Button color="inherit">Logout</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
          <Box>
            <Button variant="contained" size="large" onClick={handleClickOpen}>
              Create New User
            </Button>
            <Button component={RouterLink} to="/admin/rules" variant="outlined" size="large" sx={{ ml: 2 }}>
              Configure Rules
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="user table">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.manager}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="center">
                    <Button variant="outlined" size="small">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Full Name" type="text" fullWidth variant="standard" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <TextField margin="dense" label="Email Address" type="email" fullWidth variant="standard" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <FormControl fullWidth margin="dense" variant="standard">
            <InputLabel>Role</InputLabel>
            <Select label="Role" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <MenuItem value={"Employee"}>Employee</MenuItem>
              <MenuItem value={"Manager"}>Manager</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" variant="standard">
            <InputLabel>Assign Manager</InputLabel>
            <Select label="Assign Manager" value={assignedManager} onChange={(e) => setAssignedManager(e.target.value)}>
              <MenuItem value={"Marc"}>Marc</MenuItem>
              <MenuItem value={"Sarah"}>Sarah</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateUser}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AdminDashboard;