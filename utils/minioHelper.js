const env = require('../config/env.config')

const MINIO_PUBLIC_URL = env.MINIO_PUBLIC_URL
const MINIO_BUCKET = env.MINIO_BUCKET

const buildMinioUrl = (objectName, bucket = MINIO_BUCKET) => {
    if (!objectName) {
        return null
    }

    return `${MINIO_PUBLIC_URL}/${bucket}/${objectName}`
}

module.exports = buildMinioUrl