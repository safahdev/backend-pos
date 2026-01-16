const { z } = require('zod')
const validator = require('validator')

// auth schema
const loginSchema = z.object({
    email: z.string().refine(validator.isEmail),
    password: z.string().min(6)
})

const registerSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6).refine(val => validator.isStrongPassword(val, {
        minLength: 6,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }), {
        message: 'Password is not enough strong!. need min 6 word, min number 1, min symbol 1, min uppercase 1'
    }),
    confirmPassword: z.string(),
    email: z.string().email(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password must match',
    path: ['confirmPassword']
})

const forgotPasswordSchema = z.object({
    email: z.string().refine(validator.isEmail)
})

const updatePasswordSchema = z.object({
    email: z.string().refine(validator.isEmail),
    password: z.string().min(6).refine(val => validator.isStrongPassword(val, {
        minLength: 6,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }), {
        message: 'Password is not enough strong!. need min 6 word, min number 1, min symbol 1, min uppercase 1'
    }),

})

const resetPasswordSchema = z.object({
    otp: z.string(),
    email: z.string().refine(validator.isEmail),
    password: z.string().min(6).refine(val => validator.isStrongPassword(val, {
        minLength: 6,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }), {
        message: 'Password is not enough strong!. need min 6 word, min number 1, min symbol 1, min uppercase 1'
    }),
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