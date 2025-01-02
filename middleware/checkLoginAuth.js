const jwt = require("jsonwebtoken")

exports.checkLoginAuth = (req, res, next) => {
    const token = req.cookies.token

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            if (decoded) {
                return res.redirect("/")
            }
        } catch (error) {
            console.error("Помилка під час перевірки токена:", error)
        }
    }
    next()
}