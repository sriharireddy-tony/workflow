const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => ({ path: d.path.join('.'), message: d.message }));
    return res.status(400).json({ success: false, message: 'Validation failed', details });
  }
  req[property] = value;
  next();
};

module.exports = validate;
