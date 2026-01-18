const prisma = require('../../config/prismaConfig')
const bcrypt = require('bcryptjs')
async function main(params) {
    const password = await bcrypt.hash('password', 10)

    await prisma.user.create({
        data: {
            username: 'admin',
            email: 'admin@mail.com',
            password,
            role: 'admin'
        }
    })
}

main().catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })