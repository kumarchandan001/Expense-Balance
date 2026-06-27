import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Avatar,
  Menu, MenuItem, IconButton, Tooltip, Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { alpha } from '@mui/material/styles';

function NavBar() {
  const { logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Get first letter of email for avatar
  const getInitial = () => {
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  // Determine which pages the user can access based on role
  const canAccessEmployee = ['employee', 'manager', 'admin'].includes(user?.role);
  const canAccessManager = ['manager', 'admin'].includes(user?.role);
  const canAccessAdmin = ['admin'].includes(user?.role);

  return (
    <AppBar 
      position="static" 
      sx={{
        background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to={canAccessAdmin ? '/admin' : canAccessManager ? '/manager' : '/'}
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
              letterSpacing: '.1rem',
              flexGrow: { xs: 1, md: 0 }
            }}
          >
            EXPENSE MANAGEMENT
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
            {canAccessEmployee && (
              <Button
                component={RouterLink}
                to="/"
                sx={{
                  my: 2, 
                  color: 'white',
                  display: 'block',
                  mx: 1,
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1),
                  }
                }}
              >
                Employee Dashboard
              </Button>
            )}
            {canAccessManager && (
              <Button
                component={RouterLink}
                to="/manager"
                sx={{
                  my: 2, 
                  color: 'white',
                  display: 'block',
                  mx: 1,
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1),
                  }
                }}
              >
                Manager Dashboard
              </Button>
            )}
            {canAccessAdmin && (
              <Button
                component={RouterLink}
                to="/admin"
                sx={{
                  my: 2, 
                  color: 'white',
                  display: 'block',
                  mx: 1,
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1),
                  }
                }}
              >
                Admin Dashboard
              </Button>
            )}
            {canAccessAdmin && (
              <Button
                component={RouterLink}
                to="/admin/rules"
                sx={{
                  my: 2, 
                  color: 'white',
                  display: 'block',
                  mx: 1,
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1),
                  }
                }}
              >
                Approval Rules
              </Button>
            )}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Account settings">
              <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: '#f5f5f5', 
                    color: '#1976d2',
                    fontWeight: 'bold' 
                  }}
                >
                  {getInitial()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="textSecondary">
                  {user?.email}
                </Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="body2" color="primary" sx={{ textTransform: 'capitalize' }}>
                  Role: {user?.role}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;