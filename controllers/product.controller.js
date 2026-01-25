const prisma = require('../config/prisma.config')
const { moneyFormat } = require('../utils/moneyFormat')
const { uploadMinio, deleteMinio } = require('../config/minio.config')
const buildMinioUrl = require('../utils/minioHelper')

const getProductById = async (req, res, next) => {
    const { id } = req.params

    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                name: true,
                price: true,
                description: true,
                stock: true,
                image: true
            }
        })

        if (!product) {
            const err = new Error('Product not found')
            err.status = 400
            throw err
        }

        return res.status(200).json({
            message: `Product id: ${id} read successfully`,
            product: {
                id: product.id.toString(),
                name: product.name,
                price: moneyFormat(product.price),
                description: product.description,
                stock: product.stock,
                image: product.image,
                imageUrl: buildMinioUrl(product.image),
            }
        })
    } catch (error) {
        next(error)
    }
}

const createProduct = async (req, res, next) => {
    const { categoryId, name, price, description, stock } = req.body

    try {
        if (!req.file) {
            const err = new Error('No file uploaded')
            err.status = 400
            throw err
        }

        const upload = await uploadMinio(req.file, 'product')

        const newProduct = await prisma.product.create({
            data: {
                name: name,
                price: Number(price),
                categoryId: Number(categoryId),
                description: description,
                stock: Number(stock),
                image: upload.filename,
            },
            include: {
                category: true
            }
        })

        return res.status(201).json({
            message: 'Product created successfully',
            product: {
                id: newProduct.id.toString(),
                name: newProduct.name,
                price: moneyFormat(newProduct.price),
                description: newProduct.description,
                stock: newProduct.stock,
                image: newProduct.image,
                imageUrl: buildMinioUrl(newProduct.image),
                category: newProduct.category
            }
        })
    } catch (error) {
        next(error)
    }
}

const updateProduct = async (req, res, next) => {
    const { id } = req.params
    const { name, price, description, stock, categoryId } = req.body


    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) }
        })

        if (!product) {
            const err = new Error('Product not found')
            err.status = 400
            throw err
        }

        let image = product.image

        if (req.file) {
            if (product.image) {
                await deleteMinio(product.image)
            }
            const upload = await uploadMinio(req.file, 'product')
            image = upload.filename
        }

        const updateProduct = await prisma.product.update({
            where: { id: Number(id) },
            data: {
                categoryId: Number(categoryId),
                name: name,
                price: Number(price),
                description: description,
                stock: Number(stock),
                image: image,
                updatedAt: new Date()
            }
        })

        return res.status(200).json({
            message: `Category id: ${id} updated successfully`,
            category: {
                id: updateProduct.id.toString(),
                name: updateProduct.name,
                price: moneyFormat(updateProduct.price),
                description: updateProduct.description,
                stock: updateProduct.stock,
                image: updateProduct.image,
                imageUrl: buildMinioUrl(updateProduct.image),
                categoryId: updateProduct.categoryId

            }
        })
    } catch (error) {
        next(error)
    }
}

const deleteProduct = async (req, res, next) => {
    const { id } = req.params

    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) }
        })

        if (!product) {
            const err = new Error('Product not found')
            err.status = 400
            throw err
        }

        if (product.image) {
            await deleteMinio(product.image)
        }

        return res.status(200).json({
            message: `Product id: ${id} deleted successfully`,
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}