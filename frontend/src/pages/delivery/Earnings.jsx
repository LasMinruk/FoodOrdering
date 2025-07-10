import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Divider,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`earnings-tabpanel-${index}`}
      aria-labelledby={`earnings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DeliveryEarnings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState([]);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Filter states
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30))); // 30 days ago by default
  const [endDate, setEndDate] = useState(new Date());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Summary stats
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalDeliveries: 0,
    averagePerDelivery: 0,
    periodEarnings: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    }
  });

  // Chart data
  const [dailyChartData, setDailyChartData] = useState([]);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  
  useEffect(() => {
    if (currentUser && currentUser.role !== 'delivery_person') {
      navigate('/login');
    }
    
    fetchEarningsData();
  }, [currentUser, navigate]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Get earnings history
      const earningsResponse = await axios.get(
        `http://localhost:5010/api/delivery/earnings/${currentUser._id}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      const earningsData = Array.isArray(earningsResponse.data) ? earningsResponse.data : [];
      setEarnings(earningsData);
      
      // Calculate stats
      calculateStats(earningsData);
      
      // Prepare chart data
      prepareChartData(earningsData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching earnings data:', err);
      setError('Failed to load earnings data. Please try again later.');
      setLoading(false);
    }
  };

  const calculateStats = (earningsData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);
    
    // Calculate total earnings
    const totalEarnings = earningsData.reduce((sum, item) => sum + item.amount, 0);
    
    // Filter earnings for today, this week, and this month
    const todayEarnings = earningsData
      .filter(item => new Date(item.date) >= today)
      .reduce((sum, item) => sum + item.amount, 0);
    
    const weekEarnings = earningsData
      .filter(item => new Date(item.date) >= oneWeekAgo)
      .reduce((sum, item) => sum + item.amount, 0);
    
    const monthEarnings = earningsData
      .filter(item => new Date(item.date) >= oneMonthAgo)
      .reduce((sum, item) => sum + item.amount, 0);
    
    setStats({
      totalEarnings,
      totalDeliveries: earningsData.length,
      averagePerDelivery: earningsData.length ? (totalEarnings / earningsData.length).toFixed(2) : 0,
      periodEarnings: {
        today: todayEarnings,
        thisWeek: weekEarnings,
        thisMonth: monthEarnings
      }
    });
  };

  const prepareChartData = (earningsData) => {
    // Create a map of daily earnings
    const dailyEarningsMap = {};
    
    earningsData.forEach(item => {
      const date = new Date(item.date).toISOString().split('T')[0];
      if (!dailyEarningsMap[date]) {
        dailyEarningsMap[date] = {
          date,
          earnings: 0,
          deliveries: 0
        };
      }
      dailyEarningsMap[date].earnings += item.amount;
      dailyEarningsMap[date].deliveries += 1;
    });
    
    // Convert the map to an array and sort by date
    const dailyData = Object.values(dailyEarningsMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Format dates for display
    dailyData.forEach(item => {
      const date = new Date(item.date);
      item.displayDate = `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    setDailyChartData(dailyData);
    
    // Create weekly chart data
    const weeklyEarningsMap = {};
    
    earningsData.forEach(item => {
      const date = new Date(item.date);
      const year = date.getFullYear();
      const weekNumber = getWeekNumber(date);
      const weekKey = `${year}-W${weekNumber}`;
      
      if (!weeklyEarningsMap[weekKey]) {
        weeklyEarningsMap[weekKey] = {
          week: weekKey,
          displayWeek: `Week ${weekNumber}`,
          earnings: 0,
          deliveries: 0
        };
      }
      weeklyEarningsMap[weekKey].earnings += item.amount;
      weeklyEarningsMap[weekKey].deliveries += 1;
    });
    
    // Convert the map to an array and sort by week
    const weeklyData = Object.values(weeklyEarningsMap).sort((a, b) => 
      a.week.localeCompare(b.week)
    );
    
    setWeeklyChartData(weeklyData);
  };

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilter = () => {
    fetchEarningsData();
  };

  const handleResetFilter = () => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)));
    setEndDate(new Date());
    setTimeout(() => {
      fetchEarningsData();
    }, 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading earnings data...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>{error}</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={fetchEarningsData}>
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
          Earnings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Track your delivery earnings and performance metrics
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Earnings</Typography>
              <Typography variant="h4">${stats.totalEarnings.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>Today's Earnings</Typography>
              <Typography variant="h4">${stats.periodEarnings.today.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>This Week</Typography>
              <Typography variant="h4">${stats.periodEarnings.thisWeek.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>Total Deliveries</Typography>
              <Typography variant="h4">{stats.totalDeliveries}</Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. ${stats.averagePerDelivery} per delivery
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Date Range Filter */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    minDate={startDate}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    onClick={handleFilter}
                    fullWidth
                  >
                    Apply Filter
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={handleResetFilter}
                  >
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Tabs for different views */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                aria-label="earnings tabs"
              >
                <Tab label="Earnings History" />
                <Tab label="Charts & Analytics" />
              </Tabs>
            </Box>
            
            {/* Earnings History Tab */}
            <TabPanel value={tabValue} index={0}>
              {earnings.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No earnings data found for the selected period
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Delivery ID</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Restaurant</TableCell>
                          <TableCell>Distance</TableCell>
                          <TableCell>Time Taken</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(rowsPerPage > 0
                          ? earnings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          : earnings
                        ).map((earning) => (
                          <TableRow key={earning._id}>
                            <TableCell>{earning._id.substring(0, 8)}...</TableCell>
                            <TableCell>{formatDate(earning.date)}</TableCell>
                            <TableCell>{earning.orderId.substring(0, 8)}...</TableCell>
                            <TableCell>{earning.restaurantName || 'Unknown'}</TableCell>
                            <TableCell>{earning.distance || 'N/A'}</TableCell>
                            <TableCell>{earning.timeTaken || 'N/A'}</TableCell>
                            <TableCell align="right">${earning.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                color={earning.isPaid ? 'success.main' : 'warning.main'}
                              >
                                {earning.isPaid ? 'Paid' : 'Pending'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={earnings.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              )}
            </TabPanel>
            
            {/* Charts & Analytics Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Daily Earnings
                  </Typography>
                  <Paper sx={{ p: 2, height: 300 }}>
                    {dailyChartData.length === 0 ? (
                      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">No data available for the selected period</Typography>
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dailyChartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="displayDate" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Earnings']}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Legend />
                          <Bar dataKey="earnings" name="Earnings ($)" fill={theme.palette.primary.main} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Weekly Earnings Trend
                  </Typography>
                  <Paper sx={{ p: 2, height: 300 }}>
                    {weeklyChartData.length === 0 ? (
                      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">No data available for the selected period</Typography>
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={weeklyChartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="displayWeek" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Earnings']}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="earnings" name="Earnings ($)" stroke={theme.palette.primary.main} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Deliveries per Week
                  </Typography>
                  <Paper sx={{ p: 2, height: 300 }}>
                    {weeklyChartData.length === 0 ? (
                      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">No data available for the selected period</Typography>
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={weeklyChartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="displayWeek" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="deliveries" name="Deliveries" fill={theme.palette.secondary.main} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Earnings vs. Deliveries
                  </Typography>
                  <Paper sx={{ p: 2, height: 300 }}>
                    {dailyChartData.length === 0 ? (
                      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">No data available for the selected period</Typography>
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dailyChartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="displayDate" />
                          <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                          <YAxis yAxisId="right" orientation="right" stroke={theme.palette.secondary.main} />
                          <Tooltip 
                            formatter={(value, name) => {
                              return name === "Earnings" ? [`$${value.toFixed(2)}`, name] : [value, name];
                            }}
                          />
                          <Legend />
                          <Bar yAxisId="left" dataKey="earnings" name="Earnings" fill={theme.palette.primary.main} />
                          <Bar yAxisId="right" dataKey="deliveries" name="Deliveries" fill={theme.palette.secondary.main} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DeliveryEarnings;