import jwt from 'jsonwebtoken';

export const userAuth = (req, res, next) => {
  const token = req.cookies.user_token;
  if (!token) return res.status(401).json({ message: "User not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid user token" });
  }
};

export const departmentAuth = (req, res, next) => {
  const token = req.cookies.dept_token;
  if (!token) return res.status(401).json({ message: "Department not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.department = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid department token" });
  }
};
