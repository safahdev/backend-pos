const express = require('express')
const router = express.Router()
const productController = require('../controllers/product.controller')
const uplaod = require('../config/multer.config')
const { validateBody, validateParams, validateQuery } = require('../middlewares/validation.middleware')
const { authMiddleware, adminOnly, adminOrCashier } = require('../middlewares/auth.middleware')
const { createProductSchema, updateProductSchema, idParamSchema, paginationSchema } = require('../utils/validators/schema.validator')

router.use(authMiddleware)

router.post('/', uplaod.single('image'), validateBody(createProductSchema), adminOnly, productController.createProduct)

module.exports = router