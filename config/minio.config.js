const minio = require('minio')
const env = require('./env.config')
const fs = require('fs')

// config minio
const minioClient = new minio.Client({
    endPoint: 'play.min.io',
    port: 9000,
    useSSL: true,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY
})

// nama bucket yang diset
const bucketName = 'pos-images'

// checking bucket
const ensureBucket = async () => {
    try {
        const exist = await minioClient.bucketExists(bucketName)
        if (!exist) {
            await minioClient.makeBucket(bucketName)

            return {
                success: true,
                message: `Bucket ${bucketName} successfully created`
            }
        }

        return {
            success: true,
            message: `Bucket ${bucketName} exist`
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

// upload minio
const uploadMinio = async (file) => {
    try {
        await ensureBucket()

        let upload = await minioClient.fPutObject(bucketName, file.filename, file.path)

        const url = await minioClient.presignedGetObject(bucketName, file.filename, 24 * 60 * 60)
        // menghapus old image di folder
        fs.unlinkSync(file.path)

        return {
            success: true,
            filename: file.filename,
            url
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

// delete minio
const deleteMinio = async (filename) => {
    try {
        await minioClient.removeObject(bucketName, filename)
        return {
            success: true,
            message: 'File successfully deleted'
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

module.exports = {
    uploadMinio,
    deleteMinio
}
