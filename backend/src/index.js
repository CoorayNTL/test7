const express = require('express');
//const path = require('path');
const morgan = require('morgan');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const cors = require('cors');
const { notFound, errorHandler, getCookie,logger } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000','http://192.168.1.3:3000'], // Allow only localhost:3000 or http://192.168.1.3(for the my way I use WSL terminal) for frontend
}));
// Basic middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);
app.get('/api/cookie', getCookie);

// Not Found
app.use(notFound);

// Error Handler
app.use(errorHandler);

app.listen(port, () => console.log('Backend running on http://localhost:' + port));