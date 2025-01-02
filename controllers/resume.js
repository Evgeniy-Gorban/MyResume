exports.resume = (req, res) => {
  try {
    res.render("resume/resume", {
      title: "Resume",
      isShowAuthButtons: false,
    });

  } catch (error) {
    console.error("Помилка під час перегляду резюме:", error);
    res.status(500).render('error', { message: "Помилка під час перегляду резюме" });
  }
};
