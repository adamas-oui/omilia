const express = require('express');

const connectDB = require('./config/db');

const app = express();

//connect databse
connectDB();

//init middleware
app.use(express.json());

// app.get('/', (req, res) => res.send('API Running'));

// define route in order to access it 
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));