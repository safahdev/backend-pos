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
const bucketName = env.MINIO_BUCKET
// nama public url
const publicUrl = env.MINIO_PUBLIC_URL

// checking bucket
const ensureBucket = async () => {
    try {
        const exist = await minioClient.bucketExists(bucketName)
        if (!exist) {
            await minioClient.makeBucket(bucketName)
            const policyAllowAllRead = {
                Version: '2012-10-17',
                Id: 'allow-all-read',
                Statement: [
                    {
                        Action: ['s3:GetObject'],
                        Effect: 'Allow',
                        Principal: {
                            AWS: ['*'],
                        },
                        Resource: ['arn:aws:s3:::' + bucketName + '/*'],
                    },
                ],
            }

            await minioClient.setBucketPolicy(bucketName, JSON.stringify(policyAllowAllRead))
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
const uploadMinio = async (file, folder) => {
    try {
        await ensureBucket()

        const objectName = `${folder}/${file.filename}`

        let upload = await minioClient.fPutObject(bucketName, objectName, file.path)

        const url = await minioClient.presignedGetObject(bucketName, file.filename)
        // menghapus old image di folder
        fs.unlinkSync(file.path)

        return {
            success: true,
            filename: objectName,
            url: `${publicUrl}/${bucketName}/${objectName}`
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
