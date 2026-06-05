const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler Log]:', err);

  // Default error message and status code
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = null;

  // Handle Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Database Conflict: Resource already exists.';
    details = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Database Validation Failed.';
    details = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Database Reference Error: Associated resource does not exist.';
    details = {
      table: err.table,
      index: err.index
    };
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
