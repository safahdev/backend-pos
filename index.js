
// Main entry point Backend
const env = require('./config/env.config')
const express = require('express')
const compression = require('compression')
const { globalLimiter } = require('./utils/rateLimiter')
const cors = require('cors')
const routes = require('./routes/index')
const { errorRoute, globalError } = require('./middlewares/errorHandler.middleware')
const app = express()
const PORT = env.PORT

//  Middleware
app.use(cors())
app.use(express.json())
app.use(compression())
app.use(globalLimiter)
app.use(express.urlencoded({ extended: true }))

// routes
app.use('/api', routes)

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running'
    })
})

// Error handling middleware
app.use(globalError)

// 404 handler
app.use(errorRoute)

// listener port
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})