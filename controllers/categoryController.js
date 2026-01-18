const prisma = require('../config/prismaConfig')

const getAllCategory = async (req, res, next) => {
    const { limit, offset } = req.query

    try {
        const categories = await prisma.category.findMany({
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
            take: parseInt(limit),
            skip: parseInt(offset),
            orderBy: {
                name: 'asc'
            }
        })

        return res.status(200).json({
            message: 'Category read successfully',
            data: categories,
            limit,
            offset,
            total: categories.length
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
                icon: icon
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

    const categoryId = Number(id)

    try {
        const category = await prisma.category.findUnique({
            where: { id: categoryId }
        })

        if (!category) {
            const err = new Error('Category not exists!')
            err.status = 400
            throw err
        }

        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: {
                name: name,
                icon: icon
            }
        })
        return res.status(201).json({
            message: 'Category updated successfully',
            category: {
                id: updatedCategory.id.toString(),
                name: updatedCategory.name,
                icon: updatedCategory.icon
            }
        })
    } catch (error) {
        next(error)
    }
}


const deleteCategory = async (req, res, next) => {
    const { id } = req.params
    const categoryId = Number(id)
    try {
        const category = await prisma.category.findUnique({
            where: { id: categoryId }
        })

        if (!category) {
            const err = new Error('Category not exists!')
            err.status = 400
            throw err
        }

        await prisma.category.delete({
            where: { id: categoryId }
        })

        return res.status(200).json({
            message: 'Category deleted successfully',
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllCategory,
    createCategory,
    updateCategory,
    deleteCategory
}