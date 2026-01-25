const prisma = require("../config/prisma.config")

const midtransCallback = async (req, res, next) => {
    const { order_id, transaction_status } = req.body
    console.log()

    try {
        const transaction = await prisma.transaction.findFirst({
            where: { midtransOrderId: order_id },
            include: { transactionDetails: true }
        })

        if (!transaction) {
            const err = new Error('Transaction not found!')
            err.status = 200
            throw err
        }

        if (transaction.paymentStatus === 'paid') {
            const err = new Error('Already processed!')
            err.status = 200
            throw err
        }

        if (transaction_status === 'settlement') {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    paymentStatus: 'paid',
                    paidAt: new Date()
                }
            })


            for (const item of transaction.transactionDetails) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                })
            }
        }

        if (['expire', 'cancel', 'deny'].includes(transaction_status)) {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { paymentStatus: 'failed' }
            })
        }
        
        return res.status(200).json({ message: 'OK' })
    } catch (error) {
        next(error)
    }

}

module.exports = {
    midtransCallback
}