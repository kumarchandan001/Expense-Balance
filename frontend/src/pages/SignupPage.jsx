// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Paper, Avatar, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { signupUser } from '../services/api'; // Import the API function

function SignupPage() {
  // State for the form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    const formData = { name, email, password, country };
    try {
      const response = await signupUser(formData);
      console.log("Signup successful:", response.data);
      alert("Signup Successful!");
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Signup Failed! Check the console.");
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Admin Sign Up
          </Typography>
          <Box component="form" sx={{ mt: 3 }}>
            <TextField margin="normal" required fullWidth label="Full Name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField margin="normal" required fullWidth label="Email Address" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField margin="normal" required fullWidth name="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <TextField margin="normal" required fullWidth name="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="country-select-label">Country</InputLabel>
              <Select
                labelId="country-select-label"
                id="country-select"
                value={country}
                label="Country"
                onChange={(e) => setCountry(e.target.value)}
              >
                <MenuItem value={"IN"}>India</MenuItem>
                <MenuItem value={"US"}>United States</MenuItem>
                <MenuItem value={"GB"}>United Kingdom</MenuItem>
              </Select>
            </FormControl>

            <Button type="button" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleSignup}>
              Sign Up
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default SignupPage;