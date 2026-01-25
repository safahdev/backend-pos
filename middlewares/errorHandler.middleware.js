const errorRoute = (req, res, next) => {
    return res.status(404).json({
        message: `Route ${req.url} not found`
    })
}

const globalError = (err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        error: 'Something went wrong!',
        message: err.message
    })
}

module.exports = {
    errorRoute,
    globalError
}