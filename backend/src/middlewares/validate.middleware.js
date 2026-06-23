const { z } = require('zod');

const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.query !== undefined) req.query = parsed.query;
    if (parsed.params !== undefined) req.params = parsed.params;
    return next();
  } catch (error) {
    console.log('VALIDATION ERROR:', error);
    if (error instanceof z.ZodError || error.name === 'ZodError') {
      const errorsList = error.errors || error.issues || [];
      const errorMessage = errorsList.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return res.status(400).json({ success: false, error: errorMessage });
    }
    return res.status(400).json({ success: false, error: 'Validation Error' });
  }
};

module.exports = { validate };

