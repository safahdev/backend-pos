const express = require('express')
const router = express.Router()

const authRoutes = require('./auth.route')
const categoryRoutes = require('./category.route')
const productRoutes = require('./product.route')

router.use('/auth', authRoutes)
router.use('/categories', categoryRoutes)
router.use('/products', productRoutes)

module.exports = router