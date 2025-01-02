const jwt = require("jsonwebtoken");

exports.checkAuth = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    const publicRoutes = ["/"];
    if (publicRoutes.includes(req.path)) {
      return next();
    } else {
      console.log("Неавторизований доступ до захищеного маршруту");
      return res.status(403).send("Неавторизований доступ до захищеного маршруту");
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Помилка верифікації токена", error);
  }
};

exports.checkAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }
  console.log("Неавторизований доступ до захищеного маршруту, увійдіть до облікового запису адміністратора");
  res.status(403).send("Неавторизований доступ до захищеного маршруту, увійдіть до облікового запису адміністратора");
};
