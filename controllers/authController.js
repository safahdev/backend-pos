const prisma = require('../config/prismaConfig')
const transporter = require('../config/mailerConfig')
const generateOTp = require('../utils/generateOTP')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            const err = new Error('Email already exists')
            err.status = 400
            throw err
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                username,
                email: email,
                password: hashedPassword,
                role: 'cashier'
            }
        })

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: newUser.id.toString(),
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        })
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (!existingUser) {
            const err = new Error('invalid email')
            err.status = 400
            throw err
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password)

        if (!isPasswordValid) {
            const err = new Error('Invalid pasword')
            err.status = 400
            throw err
        }

        const token = jwt.sign(
            {
                id: existingUser.id.toString(),
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role
            }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        }
        )

        return res.status(200).json({
            message: 'login successful',
            user: {
                id: existingUser.id.toString(),
                username: existingUser.username,
                role: existingUser.role,
            },
            token,
        })

    } catch (error) {
        next(error)
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (!existingUser) {
            const err = new Error('invalid email')
            err.status = 400
            throw err
        }
        const otp = generateOTp()

        await prisma.user.update({
            where: { email },
            data: {
                otp,
                otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
            }
        })

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'OTP Reset Password',
            text: `OTP : ${otp}`
        })

        return res.status(201).json({
            success: true,
            message: 'OTP send successfully'
        })
    } catch (error) {
        next(error)
    }

}

const updatePassword = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
            }
        })

        return res.status(201).json({
            success: true,
            message: 'Password updated'
        })

    } catch (error) {
        next(error)
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiry: null
            }
        })

        return res.status(201).json({
            success: true,
            message: 'Password updated'
        })

    } catch (error) {
        next(error)
    }
}

const getMe = async (req, res, next) => {
    try {
        const userId = req.user.id

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            }
        })

        if (!user) {
            const err = new Error('Users not found')
            err.status = 400
            throw err
        }

        return res.status(200).json({
            message: 'User found successfully',
            user: {
                id: user.id.toString(),
                username: user.username,
                email: user.email,
                role: user.role
            },
        })
    } catch (error) {
        next(error)
    }
}

const logout = async (req, res) => {
    return res.status(200).json({
        message: 'Logout successfull'
    })
}

module.exports = {
    register,
    login,
    updatePassword,
    forgotPassword,
    resetPassword,
    getMe,
    logout
}