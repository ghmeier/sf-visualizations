const router = require('express').Router();

const asyncMiddleware = (fn) => {
  return (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

router.use((req, res, next) => {
  res.setHeader(
    'Cache-Control',
    'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
  );
  next();
});

router.use('/api', asyncMiddleware(require('./api')));

module.exports = router;
