// Baseline protection against MongoDB operator injection. Extend with field-level validation in Sprint 2.
const sanitizeObject = (value) => {
  if (!value || typeof value !== 'object') return;
  Object.keys(value).forEach((key) => {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key];
      return;
    }
    sanitizeObject(value[key]);
  });
};

module.exports = (req, res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
};
