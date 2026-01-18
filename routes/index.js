const express = require('express')
const router = express.Router()

const authRoutes = require('./authRoutes')
const categoryRoutes = require('./categoryRoute')

router.use('/auth', authRoutes)
router.use('/categories', categoryRoutes)

module.exports = router