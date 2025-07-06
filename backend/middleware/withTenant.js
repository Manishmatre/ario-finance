const jwt = require('jsonwebtoken');

module.exports = function withTenant(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.tenantId = decoded.tenantId;
    // Optionally, check body/params for tenantId mismatch
    if (req.body.tenantId && req.body.tenantId !== req.tenantId)
      return res.status(403).json({ error: 'Tenant mismatch' });
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
