export const authorization = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // لازم يكون req.user موجود من الـ auth middleware
      if (!req?.user || !req?.user?.role) {
        return res.status(401).json({ message: "Unauthorized: No role found" });
      }

      if (!allowedRoles.includes(req?.user?.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      return next();
    } catch (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
  };
};


