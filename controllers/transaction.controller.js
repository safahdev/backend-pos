const prisma = require("../config/prisma.config")
const snap = require('../config/midtrans.config')

const createTransaction = async (req, res, next) => {
    const { items, paymentMethod, orderType, customerName, tableNumber, note, paid } = req.body
    const paidAmount = Number(paid)
    console.log(req.body)
    const userId = parseInt(req.user.id)

    if (!items || items.length === 0) {
        const err = new Error('Items must not empty!')
        err.status = 400
        throw err
    }

    if (!['cash', 'midtrans'].includes(paymentMethod)) {
        const err = new Error('Payment not valid!')
        err.status = 400
        throw err
    }

    if (!['dine_in', 'take_away'].includes(orderType)) {
        const err = new Error('Order type not valid!')
        err.status = 400
        throw err
    }

    try {
        // set total amount = 0
        let totalAmount = 0
        // set detail = []
        const details = []

        for (const item of items) {
            const productId = Number(item.productId)
            const qty = item.qty
            const product = await prisma.product.findUnique({
                where: { id: productId }
            })

            if (!product) {
                const err = new Error('Product not found!')
                err.status = 400
                throw err
            }

            if (product.stock < qty) {
                const err = new Error(`Stock ${product.name} not enough`)
                err.status = 400
                throw err
            }

            // total harga per product
            const subtotal = Number(product.price) * qty
            // total harga semua product
            totalAmount += subtotal // tambah ke total yang sudah ada

            details.push({
                productId: product.id,
                productName: product.name,
                quantity: item.qty,
                price: product.price,
                subtotal
            })
        }

        let changeAmount = null

        if (paymentMethod === 'cash') {
            if (paidAmount < totalAmount) {
                throw new Error('Paid amount is less than total amount')
            }
            changeAmount = paidAmount - totalAmount
        }


        const transaction = await prisma.transaction.create({
            data: {
                userId,
                orderType,
                customerName,
                tableNumber,
                paymentMethod,
                // ternary jika pembayaran pakai cash maka true paid dan pending jika midtrans
                paymentStatus: paymentMethod === 'cash' ? 'paid' : 'pending',
                totalAmount,
                note,
                paidAmount: paymentMethod === 'cash' ? paidAmount : null,
                changeAmount: paymentMethod === 'cash' ? changeAmount : null,
                // ternary jika pembayaran cash maka true pakai date langsung dan null menunggu webhook midtrans
                paidAt: paymentMethod === 'cash' ? new Date() : null,
                midtransOrderId: null,
                midtransSnapToken: null,
                // create data di table transactionDetails dari array pada loop diatas
                transactionDetails: {
                    create: details
                }
            }
        })


        if (paymentMethod === 'cash') {
            for (const item of items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.qty
                        }
                    }
                })
            }
            return res.status(201).json({
                success: true,
                message: 'Transaction paid (cash)',
                transactionId: transaction.id,
                paymentStatus: transaction.paymentStatus,
                paymentMethod: transaction.paymentMethod,
                paidAmount: transaction.paidAmount,
                changeAmount: transaction.changeAmount,
                totalAmount: transaction.totalAmount
            })
        }

        // opsi pembayaran midtrans
        if (paymentMethod === 'midtrans') {
            const orderId = `ORDER-${Date.now()}-${transaction.id}`
            const snapResponse = await snap.createTransaction({
                transaction_details: {
                    order_id: orderId,
                    gross_amount: totalAmount
                },
                customer_details: {
                    first_name: customerName || 'Customer'
                }
            })

            await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    midtransOrderId: orderId,
                    midtransSnapToken: snapResponse.token
                }
            })

            return res.status(200).json({
                success: true,
                message: 'Transaction (midtrans)',
                transactionId: transaction.id,
                orderId: orderId,
                snapId: snapResponse.token,
            })
        }
    } catch (error) {
        next(error)
    }
}

const getTransaction = async (req, res, next) => {
    const search = req.query.search || ''
    const orderType = req.query.orderType

    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                customerName: {
                    contains: search
                },
                orderType: orderType
            },
            select: {
                id: true,
                orderType: true,
                customerName: true,
                tableNumber: true,
                totalAmount: true,
                createdAt: true,
                note: true,
                paymentMethod: true,
                paymentStatus: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        if (!transactions) {
            const err = new Error('Transaction not found')
            err.status = 400
            throw err
        }

        return res.status(200).json({
            message: 'Transaction read successfully',
            data: transactions
        })
    } catch (error) {
        next(error)
    }
}

const getTransactionById = async (req, res, next) => {
    const { id } = req.params

    try {
        const transactions = await prisma.transaction.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                orderType: true,
                customerName: true,
                tableNumber: true,
                totalAmount: true,
                createdAt: true,
                note: true,
                paymentMethod: true,
                paymentStatus: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                },
                transactionDetails: true

            },
        })

        if (!transactions) {
            const err = new Error('Transaction not found')
            err.status = 400
            throw err
        }

        return res.status(200).json({
            message: `Transaction id: ${id} read successfully`,
            data: transactions
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createTransaction,
    getTransaction,
    getTransactionById
}