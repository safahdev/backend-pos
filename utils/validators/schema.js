const { z } = require('zod')

// auth schema
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

const registerSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6)
        .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least 1 number')
        .regex(/[\W_]/, 'Password must contain at least 1 special character'),
    confirmPassword: z.string(),
    email: z.string().email(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password must match',
    path: ['confirmPassword']
})

const forgotPasswordSchema = z.object({
    email: z.string().email()
})

const updatePasswordSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
        .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least 1 number')
        .regex(/[\W_]/, 'Password must contain at least 1 special character'),
})

const resetPasswordSchema = z.object({
    email: z.string().email(),
    otp: z.string(),
    password: z.string().min(6)
        .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least 1 number')
        .regex(/[\W_]/, 'Password must contain at least 1 special character'),
})

// category schema
const createCategorySchema = z.object({
    name: z.string().min(1),
    icon: z.string().min(10)
})

const updateCategorySchema = createCategorySchema

// product schema
const createProductSchema = z.object({
    name: z.string().min(4),
    price: z.number().positive(),
    categoryId: z.string(),
    description: z.string().min(10),
    stock: z.number().positive()
})

const updateProductSchema = createProductSchema

// transaction schema

const transactionItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().positive()
})

const createTransactionSchema = z.object({
    customerName: z.string().optional(),
    tableNumber: z.string().optional(),
    orderType: z.enum(['dine_in', 'take_away']),
    paymentMethod: z.enum(['cash', 'midtrans']),
    note: z.string().optional(),
    items: z.array(transactionItemSchema).min(1)
})

// query schema
const paginationSchema = z.object({
    limit: z.coerce.number().min(1).max(30).default(10),
    offset: z.coerce.number().min(0).default(0)
})

// params schema
const idParamSchema = z.object({
    id: z.coerce.number()
})

module.exports = {
    loginSchema,
    registerSchema,
    updatePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,


    createCategorySchema,
    updateCategorySchema,

    createProductSchema,
    updateProductSchema,

    createTransactionSchema,

    paginationSchema,
    idParamSchema
}