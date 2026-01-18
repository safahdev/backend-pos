const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const { validateBody, validateParams, validateQuery } = require('../middlewares/validationMiddleware')
const { authMiddleware, adminOnly, adminOrCashier } = require('../middlewares/authMiddleware')
const { createCategorySchema, updateCategorySchema, idParamSchema, paginationSchema } = require('../utils/validators/schema')

router.use(authMiddleware)

router.get('/', validateQuery(paginationSchema), adminOrCashier,categoryController.getAllCategory)
router.post('/', validateBody(createCategorySchema), adminOnly, categoryController.createCategory)
router.put('/:id', validateParams(idParamSchema),validateBody(updateCategorySchema), adminOnly, categoryController.updateCategory)
router.delete('/:id', categoryController.deleteCategory)

module.exports = router