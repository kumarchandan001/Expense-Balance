// src/pages/SignupPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Paper, Avatar, Select, MenuItem, InputLabel, FormControl, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { signupUser, fetchCountries } from '../services/api';
import CircularProgress from '@mui/material/CircularProgress';

function SignupPage() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [countries, setCountries] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pwd)) return "Password must contain at least one special character.";
    return "";
  };

  useEffect(() => {
    const getCountries = async () => {
      try {
        const response = await fetchCountries();
        setCountries(response.data.map(country => country.name.common).sort());
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        setError("Failed to load countries. Please try again later.");
      }
    };
    getCountries();
  }, []);

  const handleSignup = async () => {
    const pwdValidation = validatePassword(password);
    if (pwdValidation) {
      setError(pwdValidation);
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const formData = { companyName, country, email, password };
      const response = await signupUser(formData);
      console.log("Signup response:", response); // Add this for debugging
      alert("Company and admin account created successfully!");
      navigate('/login');
    } catch (error) {
      console.error("Signup failed:", error);
      if (error.response && error.response.data) {
        setError(error.response.data.error || "Signup failed");
      } else {
        setError("Network error or server not responding");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Create Company Account
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          <Box component="form" sx={{ mt: 3 }}>
            <TextField margin="normal" required fullWidth label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <FormControl margin="normal" required fullWidth>
              <InputLabel id="country-select-label">Country</InputLabel>
              <Select
                labelId="country-select-label"
                id="country-select"
                value={country}
                label="Country"
                onChange={(e) => setCountry(e.target.value)}
              >
                {countries.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField margin="normal" required fullWidth label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField 
              margin="normal" 
              required 
              fullWidth 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              onBlur={(e) => setPasswordError(validatePassword(e.target.value))}
              error={!!passwordError}
              helperText={passwordError}
            />
            <TextField 
              margin="normal" 
              required 
              fullWidth 
              label="Confirm Password" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              error={!!error || (password !== confirmPassword && confirmPassword !== '')}
              helperText={error || (password !== confirmPassword && confirmPassword !== '' ? "Passwords do not match" : "")}
            />

            <Button type="button" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleSignup} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default SignupPage;