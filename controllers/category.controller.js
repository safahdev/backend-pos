const prisma = require('../config/prisma.config')
const buildMinioUrl = require('../utils/minioHelper')
const { moneyFormat } = require('../utils/moneyFormat')

const getAllCategoryWithProduct = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const skip = (page - 1) * limit

    const search = req.query.search || ''

    try {
        const categories = await prisma.category.findMany({
            where: {
                name: {
                    contains: search
                }
            },
            select: {
                id: true,
                name: true,
                icon: true,
                products: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        image: true,
                        description: true,
                        stock: true,
                    }
                },
            },
            orderBy: {
                name: 'asc'
            },
            skip: skip,
            take: limit
        })

        const totalCategories = await prisma.category.count({
            where: {
                name: {
                    contains: search
                }
            }
        })

        const totalPages = Math.ceil(totalCategories / limit)

        const formatted = categories.map(category => ({
            ...category,
            products: category.products.map(product => ({
                ...product,
                price: moneyFormat(product.price),
                imageUrl: buildMinioUrl(product.image)
            }))
        }))

        return res.status(200).json({
            message: 'Category read successfully',
            data: formatted,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                perPage: limit,
                total: totalCategories
            }
        })
    } catch (error) {
        next(error)
    }
}

const getCategoryWithProductById = async (req, res, next) => {
    const { id } = req.params

    try {
        const categories = await prisma.category.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                name: true,
                icon: true,
                products: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        image: true,
                        description: true,
                        stock: true,
                    }
                },
            },
        })

        const formatted = {
            ...categories,
            products: categories.products.map(product => ({
                ...product,
                price: moneyFormat(product.price),
                imageUrl: buildMinioUrl(product.image)
            }))
        }

        return res.status(200).json({
            message: `Category id: ${id} read successfully`,
            data: formatted,
        })
    } catch (error) {
        next(error)
    }
}

const createCategory = async (req, res, next) => {
    const { name, icon } = req.body

    try {
        const newCategory = await prisma.category.create({
            data: {
                name: name,
                icon: icon,
            }
        })
        return res.status(201).json({
            message: 'Category created successfully',
            category: {
                id: newCategory.id.toString(),
                name: newCategory.name,
                icon: newCategory.icon
            }
        })
    } catch (error) {
        console.log(error)
    }
}

const updateCategory = async (req, res, next) => {
    const { id } = req.params
    const { name, icon } = req.body

    try {
        const category = await prisma.category.findUnique({
            where: { id: Number(id) }
        })

        if (!category) {
            const err = new Error('Category not exists!')
            err.status = 400
            throw err
        }

        const updateCategory = await prisma.category.update({
            where: { id: Number(id) },
            data: {
                name: name,
                icon: icon,
                updatedAt: new Date()
            }
        })

        return res.status(201).json({
            message: `Category id: ${id} updated successfully`,
            category: {
                id: updateCategory.id.toString(),
                name: updateCategory.name,
                icon: updateCategory.icon
            }
        })
    } catch (error) {
        next(error)
    }
}


const deleteCategory = async (req, res, next) => {
    const { id } = req.params

    try {
        const category = await prisma.category.findUnique({
            where: { id: Number(id) }
        })

        if (!category) {
            const err = new Error('Category not exists!')
            err.status = 400
            throw err
        }

        await prisma.category.delete({
            where: { id: Number(id) }
        })

        return res.status(200).json({
            message: `Category id: ${id} deleted successfully`,
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllCategoryWithProduct,
    getCategoryWithProductById,
    createCategory,
    updateCategory,
    deleteCategory
}