// src/pages/ApprovalRulesPage.jsx
import React, { useState } from 'react';
import {
  Box, Button, Container, Typography, Paper, AppBar, Toolbar, TextField,
  FormGroup, FormControlLabel, Checkbox, Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function ApprovalRulesPage() {
  // State for each field in the form
  const [description, setDescription] = useState('');
  const [approvers, setApprovers] = useState('');
  const [isSequenced, setIsSequenced] = useState(false);
  const [isManagerFirst, setIsManagerFirst] = useState(false);
  const [percentage, setPercentage] = useState('');

  const handleSaveRule = () => {
    const ruleData = {
      description,
      approvers: approvers.split(','), // Splitting the string into an array of approvers
      isSequenced,
      isManagerFirst,
      percentage: Number(percentage)
    };
    console.log("Saving new rule:", ruleData);
    alert("Rule data logged to console. Ready for backend!");
    // Later, an API call will be made here to save the rule
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

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Configure Approval Rule
          </Typography>
          <Button component={RouterLink} to="/admin" variant="outlined">
            Back to User Management
          </Button>
        </Box>
        <Paper sx={{ p: 4 }}>
          <TextField 
            fullWidth 
            label="Rule Description (e.g., 'For Miscellaneous Expenses')" 
            variant="outlined" 
            sx={{ mb: 3 }} 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <Typography variant="h6" gutterBottom>Approvers</Typography>
          <TextField 
            fullWidth 
            label="Approvers (comma-separated emails)" 
            variant="outlined" 
            sx={{ mb: 3 }} 
            value={approvers}
            onChange={(e) => setApprovers(e.target.value)}
          />

          <FormGroup>
            <FormControlLabel 
              control={<Checkbox checked={isSequenced} onChange={(e) => setIsSequenced(e.target.checked)} />} 
              label="Approvers Sequence (Approve one by one)" 
            />
            <FormControlLabel 
              control={<Checkbox checked={isManagerFirst} onChange={(e) => setIsManagerFirst(e.target.checked)} />} 
              label="Manager must approve first" 
            />
          </FormGroup>
          
          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Conditional Rules</Typography>
          <TextField 
            type="number" 
            label="Minimum Approval Percentage (%)" 
            variant="outlined" 
            sx={{ mb: 3 }} 
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
          />

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button variant="contained" size="large" onClick={handleSaveRule}>
              Save Rule
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default ApprovalRulesPage;