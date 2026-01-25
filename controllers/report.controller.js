const prisma = require('../config/prisma.config')
const { moneyFormat } = require('../utils/moneyFormat')
const { getTransactionReportData } = require('../services/report.service')
const ExcelJS = require('exceljs')

const getDashboardSummary = async (req, res, next) => {
    try {
        // total orders paid
        const totalOrders = await prisma.transaction.count({
            where: { paymentStatus: 'paid' }
        })

        // total omzet paid
        const totalOmzet = await prisma.transaction.aggregate({
            where: { paymentStatus: 'paid' },
            _sum: {
                totalAmount: true
            }
        })

        // total item terjual
        const totalItems = await prisma.transactionDetail.aggregate({
            _sum: {
                quantity: true
            }
        })

        // total item per category 
        // { productId: 1, _sum: {quantity: 3 }} - group by
        const categorySales = await prisma.transactionDetail.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true
            }
        })

        // products 
        // { id: 1, category: {name: 'minuman'}}
        const products = await prisma.product.findMany({
            select: {
                id: true,
                category: {
                    select: {
                        name: true
                    }
                }
            }
        })
        // set object kosong
        const categoryMap = {}

        // loop 1 - {productId: 1, _sum: {quantity: 3}}
        for (const sale of categorySales) {
            // { id: 1, category: { name: "Minuman" } }
            const product = products.find(p => p.id === sale.productId)
            if (!product) {
                // kalau product not found langsung loop berikutnya
                continue
            }

            // categoryName = "Minuman"  BELUM ADA → undefined
            const categoryName = product.category.name
            // loop 1 : categoryMap["Minuman"] = 0 + 3
            // loop 2: categoryMap["Minuman"] // SUDAH ADA = 3 + 2
            // Minuman: 5,
            categoryMap[categoryName] = (categoryMap[categoryName] || 0) + sale._sum.quantity
        }

        return res.status(200).json({
            success: true,
            message: 'data report dashboard',
            data: {
                totalOrders,
                totalOmzet: moneyFormat(totalOmzet._sum.totalAmount || 0),
                totalItems: totalItems._sum.quantity || 0,
                categories: categoryMap
            }
        })
    } catch (error) {
        next(error)
    }
}

const getCategorySales = async (req, res, next) => {
    const categoryId = Number(req.params.categoryId)

    try {
        const sales = await prisma.transactionDetail.groupBy({
            by: ['productId', 'productName'],
            _sum: {
                quantity: true
            },
            where: {
                // relasi ke product
                product: { categoryId }
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            }
        })

        const result = sales.map(item => ({
            menuName: item.productName,
            totalSales: item._sum.quantity
        }))

        return res.status(200).json({
            success: true,
            message: 'data report category',
            data: result
        })
    } catch (error) {
        next(error)
    }
}

const getTransactionReport = async (req, res, next) => {
    try {
        const transactionreport = await getTransactionReportData(req.query)
        return res.status(200).json({
            success: true,
            data: transactionreport
        })
    } catch (error) {
        next(error)
    }
}

const exportTransactionExcel = async (req, res, next) => {
    try {
        const data = await getTransactionReportData(req.query)

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Transaction Report')

        // HEADER
        worksheet.columns = [
            { header: 'No Order', key: 'orderCode', width: 20 },
            { header: 'Order Date', key: 'orderDate', width: 25 },
            { header: 'Order Type', key: 'orderType', width: 15 },
            { header: 'Category', key: 'category', width: 15 },
            { header: 'Customer Name', key: 'customerName', width: 20 },
        ]

        // ISI DATA
        data.forEach(row => {
            worksheet.addRow({
                ...row,
                orderDate: new Date(row.orderDate).toLocaleString(),
            })
        })

        // RESPONSE HEADER
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=transaction-report.xlsx'
        )

        await workbook.xlsx.write(res)
        res.end()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getDashboardSummary,
    getCategorySales,
    getTransactionReport,
    exportTransactionExcel
}