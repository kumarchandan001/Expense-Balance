// src/pages/ApprovalRulesPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Typography, Paper, AppBar, Toolbar, TextField,
  FormGroup, FormControlLabel, Checkbox, Divider, Snackbar, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { createApprovalRule, fetchApprovalRules, updateApprovalRule, deleteApprovalRule } from '../services/api';

function ApprovalRulesPage() {
  const { logout } = useAuth();
  // State for each field in the form
  const [description, setDescription] = useState('');
  const [approvers, setApprovers] = useState('');
  const [isSequenced, setIsSequenced] = useState(false);
  const [isManagerFirst, setIsManagerFirst] = useState(false);
  const [percentage, setPercentage] = useState('');

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [descriptionError, setDescriptionError] = useState('');
  const [approversError, setApproversError] = useState('');
  const [percentageError, setPercentageError] = useState('');

  // State for editing and deleting
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editApprovers, setEditApprovers] = useState('');
  const [editIsSequenced, setEditIsSequenced] = useState(false);
  const [editIsManagerFirst, setEditIsManagerFirst] = useState(false);
  const [editPercentage, setEditPercentage] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const { data } = await fetchApprovalRules();
      setRules(data);
    } catch (error) {
      console.error("Failed to fetch approval rules:", error);
      setSnackbarMessage("Failed to fetch rules. " + (error.response?.data?.error || "Please try again."));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Edit Rule Functions
  const handleEditClick = (rule) => {
    setCurrentRule(rule);
    setEditDescription(rule.description);
    setEditApprovers(rule.approvers);
    setEditIsSequenced(rule.isSequenced);
    setEditIsManagerFirst(rule.isManagerFirst);
    setEditPercentage(rule.percentage || '');
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentRule(null);
    // Clear any validation errors from the edit form
    setDescriptionError('');
    setApproversError('');
    setPercentageError('');
  };

  const handleUpdateRule = async () => {
    let isValid = true;
    if (!editDescription) {
      setDescriptionError("Description is required.");
      isValid = false;
    } else {
      setDescriptionError('');
    }

    if (!editApprovers) {
      setApproversError("Approvers are required.");
      isValid = false;
    } else {
      setApproversError('');
    }

    if (editPercentage && (isNaN(Number(editPercentage)) || Number(editPercentage) <= 0 || Number(editPercentage) > 100)) {
      setPercentageError("Percentage must be a number between 1 and 100.");
      isValid = false;
    } else {
      setPercentageError('');
    }

    if (!isValid) {
      setSnackbarMessage("Please correct the errors in the form.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const updatedRuleData = {
      description: editDescription,
      approvers: editApprovers.split(',').map(email => email.trim()),
      isSequenced: editIsSequenced,
      isManagerFirst: editIsManagerFirst,
      percentage: editPercentage ? Number(editPercentage) : null
    };

    try {
      setEditLoading(true);
      await updateApprovalRule(currentRule.id, updatedRuleData);
      setSnackbarMessage("Approval rule updated successfully!");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchRules(); // Refresh rules
      handleCloseEditDialog();
    } catch (error) {
      console.error("Error updating rule:", error);
      setSnackbarMessage("Failed to update rule. " + (error.response?.data?.error || "Please try again."));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Rule Functions
  const handleDeleteClick = (rule) => {
    setCurrentRule(rule);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCurrentRule(null);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteApprovalRule(currentRule.id);
      setSnackbarMessage("Approval rule deleted successfully!");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchRules(); // Refresh rules
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting rule:", error);
      setSnackbarMessage("Failed to delete rule. " + (error.response?.data?.error || "Please try again."));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveRule = async () => {
    let isValid = true;
    if (!description) {
      setDescriptionError("Description is required.");
      isValid = false;
    } else {
      setDescriptionError('');
    }

    if (!approvers) {
      setApproversError("Approvers are required.");
      isValid = false;
    } else {
      setApproversError('');
    }

    if (percentage && (isNaN(Number(percentage)) || Number(percentage) <= 0 || Number(percentage) > 100)) {
      setPercentageError("Percentage must be a number between 1 and 100.");
      isValid = false;
    } else {
      setPercentageError('');
    }

    if (!isValid) {
      setSnackbarMessage("Please correct the errors in the form.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const ruleData = {
      description,
      approvers: approvers.split(',').map(email => email.trim()),
      isSequenced,
      isManagerFirst,
      percentage: percentage ? Number(percentage) : null
    };
    
    try {
      setSaveLoading(true);
      await createApprovalRule(ruleData);
      setSnackbarMessage("Approval rule saved successfully!");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setDescription('');
      setApprovers('');
      setIsSequenced(false);
      setIsManagerFirst(false);
      setPercentage('');
      fetchRules(); // Refresh the list of rules
    } catch (error) {
      console.error("Error saving rule:", error);
      setSnackbarMessage("Failed to save rule. " + (error.response?.data?.error || "Please check the form."));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Expense Management - Admin
          </Typography>
          <Button color="inherit" component={RouterLink} to="/admin" sx={{ mr: 2 }}>
            Back to Dashboard
          </Button>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Approval Rules Configuration
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Create New Rule
          </Typography>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Rule Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!descriptionError}
              helperText={descriptionError}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Approvers (comma-separated emails)"
              value={approvers}
              onChange={(e) => setApprovers(e.target.value)}
              error={!!approversError}
              helperText={approversError || "Enter email addresses separated by commas"}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Minimum Approval Percentage (optional)"
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              error={!!percentageError}
              helperText={percentageError || "Leave blank for requiring all approvers"}
            />
            <FormGroup sx={{ mt: 2 }}>
              <FormControlLabel
                control={<Checkbox checked={isSequenced} onChange={(e) => setIsSequenced(e.target.checked)} />}
                label="Sequential Approval (approvers must approve in order)"
              />
              <FormControlLabel
                control={<Checkbox checked={isManagerFirst} onChange={(e) => setIsManagerFirst(e.target.checked)} />}
                label="Manager First (employee's manager must approve first)"
              />
            </FormGroup>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveRule}
                disabled={saveLoading}
              >
                {saveLoading ? <CircularProgress size={24} /> : "Save Rule"}
              </Button>
            </Box>
          </Box>
        </Paper>

        <Typography variant="h5" component="h2" gutterBottom>
          Existing Rules
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Approvers</TableCell>
                <TableCell>Sequential</TableCell>
                <TableCell>Manager First</TableCell>
                <TableCell>Min. Percentage</TableCell>
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
              ) : rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No approval rules found. Create your first rule above.
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>{rule.description}</TableCell>
                    <TableCell>{Array.isArray(rule.approvers) ? rule.approvers.join(', ') : rule.approvers}</TableCell>
                    <TableCell>{rule.isSequenced ? "Yes" : "No"}</TableCell>
                    <TableCell>{rule.isManagerFirst ? "Yes" : "No"}</TableCell>
                    <TableCell>{rule.percentage ? `${rule.percentage}%` : "All required"}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditClick(rule)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(rule)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Approval Rule</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Rule Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            error={!!descriptionError}
            helperText={descriptionError}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Approvers (comma-separated emails)"
            value={editApprovers}
            onChange={(e) => setEditApprovers(e.target.value)}
            error={!!approversError}
            helperText={approversError || "Enter email addresses separated by commas"}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Minimum Approval Percentage (optional)"
            type="number"
            value={editPercentage}
            onChange={(e) => setEditPercentage(e.target.value)}
            error={!!percentageError}
            helperText={percentageError || "Leave blank for requiring all approvers"}
          />
          <FormGroup sx={{ mt: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={editIsSequenced} onChange={(e) => setEditIsSequenced(e.target.checked)} />}
              label="Sequential Approval (approvers must approve in order)"
            />
            <FormControlLabel
              control={<Checkbox checked={editIsManagerFirst} onChange={(e) => setEditIsManagerFirst(e.target.checked)} />}
              label="Manager First (employee's manager must approve first)"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={editLoading}>Cancel</Button>
          <Button onClick={handleUpdateRule} color="primary" disabled={editLoading}>
            {editLoading ? <CircularProgress size={24} /> : "Update Rule"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the rule "{currentRule?.description}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ApprovalRulesPage;