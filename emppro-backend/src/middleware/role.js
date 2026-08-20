const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: No role found'
      });
    }
    
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Insufficient permissions'
      });
    }
    
    next();
  };
};

module.exports = { authorize };