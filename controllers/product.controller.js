const prisma = require('../config/prisma.config')
const { moneyFormat } = require('../utils/moneyFormat')
const { uploadMinio, deleteMinio } = require('../config/minio.config')

const createProduct = async (req, res, next) => {
    const { categoryId, name, price, description, stock } = req.body

    try {
        if (!req.file) {
            const err = new Error('No file uploaded')
            err.status = 400
            throw err
        }

        const result = await uploadMinio(req.file, 'product')

        const newProduct = await prisma.product.create({
            data: {
                name: name,
                price: Number(price),
                categoryId: Number(categoryId),
                description: description,
                stock: Number(stock),
                image: result.filename,
            },
            include: {
                category: true
            }
        })

        return res.status(201).json({
            message: 'Product created successfully',
            product: {
                name: newProduct.name,
                price: moneyFormat(newProduct.price),
                description: newProduct.description,
                stock: newProduct.stock,
                image: newProduct.image,
                url: result.url,
                category: newProduct.category
            }
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createProduct
}