const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const db = require('./database/db');

const app = express();
// Use port 9090 to avoid conflicts with other services
const PORT = 9090;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from multiple locations
app.use(express.static(path.join(__dirname, '../preview/dist')));
app.use(express.static(path.join(__dirname, '../core/dist')));
app.use(express.static(path.join(__dirname, 'public')));

// API routes

// Example route to test API
app.get('/api/health', async (req, res) => {
  const isConnected = await db.testConnection();
  res.json({ 
    status: 'ok',
    databaseConnected: isConnected
  });
});

// User routes
app.get('/api/users', (req, res) => {
  // Sample data - in a real app, this would come from a database
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive' }
  ];
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  // In a real app, fetch user by ID from database
  const userId = parseInt(req.params.id);
  // Sample mock data
  const user = { 
    id: userId, 
    name: 'John Doe', 
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2023-03-01T10:30:00Z',
    created: '2022-01-15T08:00:00Z'
  };
  res.json(user);
});

app.post('/api/users', (req, res) => {
  // In a real app, validate and save user to database
  const newUser = req.body;
  // Mock response - pretend we saved it and assigned an ID
  res.status(201).json({ ...newUser, id: 4, created: new Date().toISOString() });
});

app.put('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const updates = req.body;
  // Mock response - pretend we updated the user
  res.json({ id: userId, ...updates, updated: new Date().toISOString() });
});

app.delete('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  // Mock response - pretend we deleted the user
  res.json({ id: userId, deleted: true });
});

// Dashboard analytics routes
app.get('/api/analytics/summary', (req, res) => {
  // Sample analytics data
  const summary = {
    totalUsers: 1250,
    activeUsers: 840,
    revenue: 52400,
    orders: 328,
    conversion: 3.2,
    averageOrderValue: 159.76
  };
  res.json(summary);
});

app.get('/api/analytics/traffic', (req, res) => {
  // Sample traffic data for a chart
  const traffic = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        name: 'Direct',
        data: [1230, 1540, 1200, 1760, 1850, 2300]
      },
      {
        name: 'Organic Search',
        data: [2100, 2310, 2400, 2200, 2500, 2800]
      },
      {
        name: 'Social Media',
        data: [540, 820, 900, 1200, 1450, 1800]
      }
    ]
  };
  res.json(traffic);
});

// Products/inventory routes
app.get('/api/products', (req, res) => {
  // Sample product data
  const products = [
    { id: 1, name: 'Product A', category: 'Electronics', price: 199.99, stock: 45 },
    { id: 2, name: 'Product B', category: 'Clothing', price: 49.99, stock: 120 },
    { id: 3, name: 'Product C', category: 'Home Goods', price: 79.99, stock: 32 }
  ];
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  // Sample product details
  const product = {
    id: productId,
    name: 'Product A',
    description: 'This is a detailed description of Product A with specifications and features.',
    category: 'Electronics',
    price: 199.99,
    stock: 45,
    images: ['/images/product-a-1.jpg', '/images/product-a-2.jpg'],
    specifications: {
      dimensions: '10 x 5 x 2 inches',
      weight: '1.5 lbs',
      color: 'Black'
    }
  };
  res.json(product);
});

// Settings routes
app.get('/api/settings', (req, res) => {
  // Sample settings
  const settings = {
    siteTitle: 'Dealer Dashboard',
    theme: 'light',
    notifications: {
      email: true,
      push: false,
      sms: false
    },
    language: 'en-US',
    currency: 'USD'
  };
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  const updates = req.body;
  // Mock response - pretend we updated settings
  res.json({ ...updates, updated: new Date().toISOString() });
});

//============================================================================
// AUTHENTICATION & USER MANAGEMENT ROUTES
//============================================================================

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // In a real app, you would verify credentials against the database
    // For now, we'll mock the authentication flow
    const users = await db.executeQuery(`SELECT * FROM users WHERE email = @param0`, [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    // In a real app, you would compare the hashed password
    // For now, we'll assume it matches
    
    // Generate a token (in a real app this would be a JWT)
    const token = "mock_token_" + Date.now();
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    // Check if user already exists
    const existingUsers = await db.executeQuery(`SELECT * FROM users WHERE email = @param0`, [email]);
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // In a real app, you would hash the password before storing
    const userData = {
      username,
      email,
      password_hash: password, // This should be hashed in production
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const newUser = await db.insert('users', userData);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify 2-step verification
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { userId, verificationCode } = req.body;
    
    if (!userId || !verificationCode) {
      return res.status(400).json({ error: 'User ID and verification code are required' });
    }
    
    // In a real app, you would verify the code against what was sent to the user
    // For now, we'll mock the verification
    if (verificationCode === '123456') {
      res.json({ message: 'Verification successful' });
    } else {
      res.status(401).json({ error: 'Invalid verification code' });
    }
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getAll('users');
    res.json(users);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to fetch users from database' });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.getById('users', req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to fetch user from database' });
  }
});

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    
    // Validate required fields
    if (!userData.username || !userData.email || !userData.password_hash) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    const newUser = await db.insert('users', userData);
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update a user
app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    
    const updatedUser = await db.update('users', userId, userData);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const success = await db.deleteById('users', userId);
    
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get/update user profile
app.get('/api/profile', async (req, res) => {
  try {
    // In a real app, you would get the user ID from the JWT token
    // For now, we'll mock it
    const userId = 1; // This would come from authentication middleware
    
    const user = await db.getById('users', userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't send sensitive information
    const { password_hash, ...profile } = user;
    
    res.json(profile);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    // In a real app, you would get the user ID from the JWT token
    const userId = 1; // This would come from authentication middleware
    
    const profileData = req.body;
    
    // Don't allow updating sensitive fields through this endpoint
    delete profileData.password_hash;
    delete profileData.role;
    
    const updatedUser = await db.update('users', userId, profileData);
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't send sensitive information
    const { password_hash, ...profile } = updatedUser;
    
    res.json(profile);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

//============================================================================
// DASHBOARD DATA ROUTES
//============================================================================

// Get summary statistics for dashboard widgets
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // In a real app, you would query the database for actual statistics
    // For now, we'll return mock data
    res.json({
      userCount: 1250,
      dailyActiveUsers: 847,
      newUsers: 385,
      totalRevenue: 28750,
      pendingOrders: 47,
      completedOrders: 520,
      tasks: {
        pending: 18,
        inProgress: 7,
        completed: 32
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Provide data for charts
app.get('/api/dashboard/charts', async (req, res) => {
  try {
    // In a real app, you would query the database for actual chart data
    // For now, we'll return mock data
    res.json({
      revenue: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Revenue",
            data: [4500, 5200, 4800, 5800, 6000, 5500]
          }
        ]
      },
      users: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "New Users",
            data: [120, 145, 150, 210, 250, 200]
          },
          {
            label: "Active Users",
            data: [320, 345, 375, 390, 450, 420]
          }
        ]
      },
      orders: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Orders",
            data: [85, 100, 90, 120, 115, 105]
          }
        ]
      }
    });
  } catch (err) {
    console.error('Dashboard charts error:', err);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

//============================================================================
// CONTENT MANAGEMENT ROUTES
//============================================================================

// Task management
app.get('/api/content/tasks', async (req, res) => {
  try {
    const tasks = await db.getAll('tasks');
    res.json(tasks);
  } catch (err) {
    console.error('Tasks fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/content/tasks', async (req, res) => {
  try {
    const taskData = req.body;
    
    if (!taskData.title) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    
    const newTask = await db.insert('tasks', {
      ...taskData,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Task creation error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/content/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const taskData = req.body;
    
    const updatedTask = await db.update('tasks', taskId, {
      ...taskData,
      updated_at: new Date()
    });
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(updatedTask);
  } catch (err) {
    console.error('Task update error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/content/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const success = await db.deleteById('tasks', taskId);
    
    if (!success) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Task deletion error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Gallery management
app.get('/api/content/gallery', async (req, res) => {
  try {
    const images = await db.getAll('gallery');
    res.json(images);
  } catch (err) {
    console.error('Gallery fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

app.post('/api/content/gallery', async (req, res) => {
  try {
    const imageData = req.body;
    
    if (!imageData.url || !imageData.title) {
      return res.status(400).json({ error: 'Image URL and title are required' });
    }
    
    const newImage = await db.insert('gallery', {
      ...imageData,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.status(201).json(newImage);
  } catch (err) {
    console.error('Gallery image creation error:', err);
    res.status(500).json({ error: 'Failed to add gallery image' });
  }
});

app.delete('/api/content/gallery/:id', async (req, res) => {
  try {
    const imageId = req.params.id;
    const success = await db.deleteById('gallery', imageId);
    
    if (!success) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Gallery image deletion error:', err);
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
});

// FAQ management
app.get('/api/content/faq', async (req, res) => {
  try {
    const faqs = await db.getAll('faqs');
    res.json(faqs);
  } catch (err) {
    console.error('FAQ fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

app.post('/api/content/faq', async (req, res) => {
  try {
    const faqData = req.body;
    
    if (!faqData.question || !faqData.answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }
    
    const newFaq = await db.insert('faqs', {
      ...faqData,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.status(201).json(newFaq);
  } catch (err) {
    console.error('FAQ creation error:', err);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

app.put('/api/content/faq/:id', async (req, res) => {
  try {
    const faqId = req.params.id;
    const faqData = req.body;
    
    const updatedFaq = await db.update('faqs', faqId, {
      ...faqData,
      updated_at: new Date()
    });
    
    if (!updatedFaq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    
    res.json(updatedFaq);
  } catch (err) {
    console.error('FAQ update error:', err);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

app.delete('/api/content/faq/:id', async (req, res) => {
  try {
    const faqId = req.params.id;
    const success = await db.deleteById('faqs', faqId);
    
    if (!success) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    
    res.json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    console.error('FAQ deletion error:', err);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

//============================================================================
// E-COMMERCE RELATED ROUTES
//============================================================================

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.getAll('products');
    res.json(products);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to fetch products from database' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.getById('products', req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to fetch product from database' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const productData = req.body;
    
    // Validate required fields
    if (!productData.name || !productData.price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    const newProduct = await db.insert('products', productData);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;
    
    const updatedProduct = await db.update('products', productId, productData);
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const success = await db.deleteById('products', productId);
    
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Order management
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getAll('orders');
    res.json(orders);
  } catch (err) {
    console.error('Orders fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await db.getById('orders', req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    if (!orderData.user_id || !orderData.items || !orderData.total) {
      return res.status(400).json({ error: 'User ID, items, and total are required' });
    }
    
    const newOrder = await db.insert('orders', {
      ...orderData,
      status: orderData.status || 'pending',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderData = req.body;
    
    const updatedOrder = await db.update('orders', orderId, {
      ...orderData,
      updated_at: new Date()
    });
    
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(updatedOrder);
  } catch (err) {
    console.error('Order update error:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Invoice management
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await db.getAll('invoices');
    res.json(invoices);
  } catch (err) {
    console.error('Invoices fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const invoice = await db.getById('invoices', req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    console.error('Invoice fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const invoiceData = req.body;
    
    if (!invoiceData.order_id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    
    const newInvoice = await db.insert('invoices', {
      ...invoiceData,
      status: invoiceData.status || 'unpaid',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.status(201).json(newInvoice);
  } catch (err) {
    console.error('Invoice creation error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoiceData = req.body;
    
    const updatedInvoice = await db.update('invoices', invoiceId, {
      ...invoiceData,
      updated_at: new Date()
    });
    
    if (!updatedInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(updatedInvoice);
  } catch (err) {
    console.error('Invoice update error:', err);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Pricing plans
app.get('/api/pricing', async (req, res) => {
  try {
    const plans = await db.getAll('pricing_plans');
    res.json(plans);
  } catch (err) {
    console.error('Pricing plans fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
});

app.post('/api/pricing', async (req, res) => {
  try {
    const planData = req.body;
    
    if (!planData.name || !planData.price) {
      return res.status(400).json({ error: 'Plan name and price are required' });
    }
    
    const newPlan = await db.insert('pricing_plans', {
      ...planData,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.status(201).json(newPlan);
  } catch (err) {
    console.error('Pricing plan creation error:', err);
    res.status(500).json({ error: 'Failed to create pricing plan' });
  }
});

//============================================================================
// SYSTEM ROUTES
//============================================================================

// Logs management
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await db.getAll('system_logs');
    res.json(logs);
  } catch (err) {
    console.error('Logs fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const logData = req.body;
    
    if (!logData.message || !logData.level) {
      return res.status(400).json({ error: 'Message and level are required' });
    }
    
    const newLog = await db.insert('system_logs', {
      ...logData,
      timestamp: new Date()
    });
    
    res.status(201).json(newLog);
  } catch (err) {
    console.error('Log creation error:', err);
    res.status(500).json({ error: 'Failed to create log entry' });
  }
});

// Settings management
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.getAll('settings');
    
    // Convert to key-value pairs
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    res.json(settingsObject);
  } catch (err) {
    console.error('Settings fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings/:key', async (req, res) => {
  try {
    const key = req.params.key;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    // Check if setting exists
    const existingSettings = await db.executeQuery(`SELECT * FROM settings WHERE key = @param0`, [key]);
    
    let result;
    if (existingSettings.length > 0) {
      // Update existing setting
      result = await db.update('settings', existingSettings[0].id, { value });
    } else {
      // Create new setting
      result = await db.insert('settings', { key, value });
    }
    
    res.json({ key, value: result.value });
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Uptime monitoring
app.get('/api/uptime', async (req, res) => {
  try {
    // In a real app, you would query actual uptime data
    // For now, we'll return mock data
    res.json({
      uptime: process.uptime(),
      serverStartTime: new Date(Date.now() - process.uptime() * 1000).toISOString(),
      status: 'online',
      memoryUsage: process.memoryUsage(),
      systemLoad: process.cpuUsage()
    });
  } catch (err) {
    console.error('Uptime fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch uptime data' });
  }
});

//============================================================================
// DATA VISUALIZATION ROUTES
//============================================================================

// Tables data
app.get('/api/data/tables', async (req, res) => {
  try {
    // Get query parameters for pagination, sorting, etc.
    const { table, page = 1, limit = 10, sort, order } = req.query;
    
    if (!table) {
      return res.status(400).json({ error: 'Table parameter is required' });
    }
    
    let query = `SELECT * FROM ${table}`;
    
    // Add sorting if provided
    if (sort && order) {
      query += ` ORDER BY ${sort} ${order === 'desc' ? 'DESC' : 'ASC'}`;
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
    
    const data = await db.executeQuery(query);
    
    // Get total count for pagination
    const countResult = await db.executeQuery(`SELECT COUNT(*) as total FROM ${table}`);
    const total = countResult[0].total;
    
    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Tables data fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch table data' });
  }
});

// Charts data
app.get('/api/data/charts', async (req, res) => {
  try {
    const { type } = req.query;
    
    if (!type) {
      return res.status(400).json({ error: 'Chart type is required' });
    }
    
    let data;
    
    // Generate different data based on chart type
    switch (type) {
      case 'line':
        data = {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "Sales 2022",
              data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 55, 70, 80]
            },
            {
              label: "Sales 2023",
              data: [28, 48, 40, 19, 86, 27, 90, 85, 90, 100, 95, 110]
            }
          ]
        };
        break;
      case 'bar':
        data = {
          labels: ["Q1", "Q2", "Q3", "Q4"],
          datasets: [
            {
              label: "Revenue",
              data: [15000, 20000, 17500, 25000]
            },
            {
              label: "Expenses",
              data: [10000, 12000, 9500, 15000]
            }
          ]
        };
        break;
      case 'pie':
        data = {
          labels: ["Product A", "Product B", "Product C", "Product D"],
          datasets: [
            {
              data: [35, 25, 20, 20]
            }
          ]
        };
        break;
      default:
        return res.status(400).json({ error: 'Invalid chart type' });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Charts data fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// Maps data
app.get('/api/data/maps', async (req, res) => {
  try {
    const { type } = req.query;
    
    if (!type) {
      return res.status(400).json({ error: 'Map type is required' });
    }
    
    let data;
    
    // Generate different data based on map type
    switch (type) {
      case 'world':
        data = {
          regions: [
            { id: "US", value: 2000, name: "United States" },
            { id: "CA", value: 1200, name: "Canada" },
            { id: "GB", value: 1800, name: "United Kingdom" },
            { id: "DE", value: 1600, name: "Germany" },
            { id: "FR", value: 1400, name: "France" },
            { id: "CN", value: 2200, name: "China" },
            { id: "IN", value: 1900, name: "India" },
            { id: "BR", value: 1100, name: "Brazil" },
            { id: "AU", value: 900, name: "Australia" }
          ]
        };
        break;
      case 'markers':
        data = {
          markers: [
            { lat: 40.7128, lng: -74.0060, name: "New York", value: 2000 },
            { lat: 34.0522, lng: -118.2437, name: "Los Angeles", value: 1700 },
            { lat: 51.5074, lng: -0.1278, name: "London", value: 1800 },
            { lat: 48.8566, lng: 2.3522, name: "Paris", value: 1500 },
            { lat: 35.6762, lng: 139.6503, name: "Tokyo", value: 2200 },
            { lat: 22.3193, lng: 114.1694, name: "Hong Kong", value: 1900 },
            { lat: -33.8688, lng: 151.2093, name: "Sydney", value: 1300 },
            { lat: -37.8136, lng: 144.9631, name: "Melbourne", value: 1100 }
          ]
        };
        break;
      default:
        return res.status(400).json({ error: 'Invalid map type' });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Maps data fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch map data' });
  }
});

// Add API test page route
app.get('/api-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/api-test.html'));
});

// For all other routes, serve the main app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../preview/dist/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`View API test page at http://localhost:${PORT}/api-test`);
}); 