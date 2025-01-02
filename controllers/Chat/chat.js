
exports.chatGet = async (req, res) => {
    try {
        const userName = req.user ? req.user.username : null;
        if (!req.user) {
            return res.redirect("/auth/login")
        }
        res.render("chat/chat", {
            title: "Чат",
            isLoggedIn: true,
            isShowAuthButtons: true,
            userName: userName,
        });
    } catch (error) {
        console.error("Помилка під час перегляду чату:", error);
        res.status(500).send("Помилка під час перегляду чату");
    }
};