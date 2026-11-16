// NOT FOUND
export const notFound = (req, res, next) => {
    const error = new Error(
        `Not Found - ${req.originalUrl}`
    );

    res.status(404);

    next(error);
};

// GLOBAL ERROR HANDLER
export const errorHandler = (
    err,
    req,
    res,
    next
) => {
    let statusCode =
        res.statusCode === 200 ? err.statusCode || err.status || 500 : res.statusCode;

    let message = err.message;

    // MONGODB BAD OBJECT ID
    if (err.name === "CastError") {
        statusCode = 404;
        message = "Resource not found";
    }

    // DUPLICATE KEY ERROR
    if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate field value entered";
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && {stack: err.stack}),
    });
};