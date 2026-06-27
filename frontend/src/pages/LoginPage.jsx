// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Paper, Avatar, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { loginUser } from '../services/api';
import { useAuth } from '../services/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const formData = { email, password };
      const { data } = await loginUser(formData);
      
      // Create user profile with token and role
      const userProfile = {
        token: data.token,
        userId: data.userId,
        role: data.role,
        companyId: data.companyId
      };
      
      // Use the login function from AuthContext
      login(userProfile);
      
      // Redirect based on user role
      if (userProfile.role === 'admin') {
        navigate('/admin');
      } else if (userProfile.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/');
      }
      
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
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
            Sign In
          </Typography>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/signup" variant="body2">
                    {"Don't have an account? Sign Up"}
                </Link>
                {/* <br />
                <Link href="#" variant="body2" sx={{ mt: 1, display: 'inline-block' }}>
                    Forgot password?
                </Link> */}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;