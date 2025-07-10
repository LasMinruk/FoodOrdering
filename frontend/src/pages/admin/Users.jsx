import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Avatar,
  Switch,
  FormControlLabel
} from '@mui/material';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5007/api/auth/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setOpenUserDialog(true);
  };

  const handleOpenStatusDialog = (user) => {
    setSelectedUser(user);
    setOpenStatusDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setSelectedUser(null);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
  };

  const handleToggleUserStatus = async () => {
    try {
      const newStatus = !selectedUser.isActive;
      
      await axios.patch(`http://localhost:5007/api/auth/users/${selectedUser._id}/status`, {
        isActive: newStatus
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update the local state
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, isActive: newStatus } : user
      ));
      
      handleCloseStatusDialog();
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status. Please try again.');
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'customer':
        return 'Customer';
      case 'restaurant_admin':
        return 'Restaurant Owner';
      case 'delivery_person':
        return 'Delivery Person';
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'restaurant_admin':
        return 'secondary';
      case 'delivery_person':
        return 'info';
      case 'customer':
        return 'success';
      default:
        return 'default';
    }
  };

  // Filter users based on role, status and search term
  const filteredUsers = users.filter(user => {
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) || 
      (statusFilter === 'inactive' && !user.isActive);
    const searchTerm = search.toLowerCase();
    const searchMatch = 
      user._id.toLowerCase().includes(searchTerm) ||
      (user.name && user.name.toLowerCase().includes(searchTerm)) || 
      (user.email && user.email.toLowerCase().includes(searchTerm)) ||
      (user.phone && user.phone.includes(searchTerm));
    
    return roleMatch && statusMatch && searchMatch;
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading users...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={fetchUsers}>
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          View and manage user accounts
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="role-filter-label">Filter by Role</InputLabel>
              <Select
                labelId="role-filter-label"
                id="role-filter-select"
                value={roleFilter}
                label="Filter by Role"
                onChange={handleRoleFilterChange}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Administrators</MenuItem>
                <MenuItem value="customer">Customers</MenuItem>
                <MenuItem value="restaurant_admin">Restaurant Owners</MenuItem>
                <MenuItem value="delivery_person">Delivery Personnel</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="status-filter-label">Filter by Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter-select"
                value={statusFilter}
                label="Filter by Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="search-user"
              label="Search by Name, Email or Phone"
              variant="outlined"
              size="small"
              value={search}
              onChange={handleSearchChange}
            />
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={user.image} 
                          alt={user.name}
                          sx={{ mr: 2, width: 32, height: 32 }}
                        >
                          {user.name?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{user.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'Not provided'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isActive ? 'Active' : 'Blocked'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                        icon={user.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewUser(user)}
                        size="small"
                        title="View User Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color={user.isActive ? "error" : "success"}
                        onClick={() => handleOpenStatusDialog(user)}
                        size="small"
                        title={user.isActive ? "Block User" : "Unblock User"}
                      >
                        {user.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* User Details Dialog */}
      <Dialog 
        open={openUserDialog} 
        onClose={handleCloseUserDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  src={selectedUser.image} 
                  alt={selectedUser.name}
                  sx={{ width: 64, height: 64, mr: 2 }}
                >
                  {selectedUser.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Chip 
                    label={getRoleLabel(selectedUser.role)}
                    color={getRoleColor(selectedUser.role)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>Account Information</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">User ID</Typography>
                  <Typography variant="body1">{selectedUser._id}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedUser.email}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedUser.phone || 'Not provided'}</Typography>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle2" gutterBottom>Address</Typography>
              {selectedUser.address ? (
                <Typography variant="body1">
                  {selectedUser.address.addressLine1}, {selectedUser.address.addressLine2}
                  <br />
                  {selectedUser.address.homeTown}, {selectedUser.address.postalCode}
                </Typography>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No address information
                </Typography>
              )}
              
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={selectedUser.isActive} 
                      color="primary"
                      disabled
                    />
                  }
                  label={selectedUser.isActive ? "Account Active" : "Account Blocked"}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* User Status Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
        <DialogTitle>
          {selectedUser?.isActive ? 'Block User' : 'Unblock User'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {selectedUser?.isActive ? 'block' : 'unblock'} {selectedUser?.name}?
            {selectedUser?.isActive 
              ? ' Blocked users will not be able to use the platform.'
              : ' This will restore the user\'s access to the platform.'
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button 
            onClick={handleToggleUserStatus} 
            variant="contained" 
            color={selectedUser?.isActive ? "error" : "success"}
          >
            {selectedUser?.isActive ? 'Block' : 'Unblock'} User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsers;