const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true // strip fields not in schema
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      // Provide the first specific message to match the required validation message
      return res.status(400).json({
        error: error.details[0].message || 'Validation Failed',
        details: errors
      });
    }

    // Replace req.body with the sanitized and parsed values
    req.body = value;
    next();
  };
};

module.exports = {
  validateBody
};
