
// Main entry point Backend
require('dotenv').config()
const express = require('express')
const compression = require('compression')
const { globalLimiter } = require('./utils/rateLimiter')
const cors = require('cors')
const routes = require('./routes/index')
const { errorRoute, globalError } = require('./middlewares/errorHandler.middleware')
const app = express()
const PORT = process.env.PORT

// testing minio & multer
// const upload = require('./config/multer.config')
// const { uploadMinio, deleteMinio } = require('./config/minio.config')

//  Middleware
app.use(cors())
app.use(express.json())
app.use(compression())
app.use(globalLimiter)
app.use(express.urlencoded({ extended: true }))

// routes
app.use('/api', routes)

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running'
    })
})

// test upload
// app.post('/upload', upload.single('image'), async (req, res) => {
//     try {
//         if (!req.file) {a
//             return res.status(400).json({ success: false, message: 'No file uploaded' });
//         }

//         // upload ke Minio
//         const result = await uploadMinio(req.file);

//         if (!result.success) {
//             return res.status(500).json({
//                 meta: { success: false, message: result.message },
//                 errors: result.error
//             });
//         }

//         res.status(200).json({
//             meta: { success: true, message: 'File uploaded successfully!' },
//             data: {
//                 filename: result.filename,
//                 url: result.url
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             meta: { success: false, message: 'Something went wrong!' },
//             errors: error.message
//         });
//     }
// });

// // test delete
// app.delete('/delete/:filename', async (req, res) => {
//     try {
//         const { filename } = req.params;
//         const result = await deleteMinio(filename);

//         if (!result.success) {
//             return res.status(500).json({
//                 meta: { success: false, message: result.message },
//                 errors: result.error
//             });
//         }

//         res.status(200).json({
//             meta: { success: true, message: 'File deleted successfully!' },
//             data: { filename }
//         });
//     } catch (error) {
//         res.status(500).json({
//             meta: { success: false, message: 'Something went wrong!' },
//             errors: error.message
//         });
//     }
// });

// Error handling middleware
app.use(globalError)

// 404 handler
app.use(errorRoute)

// listener port
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})