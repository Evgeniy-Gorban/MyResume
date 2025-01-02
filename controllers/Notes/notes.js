
const path = require("path")
const fs = require("fs").promises;

exports.notesGet = async (req, res) => {
    try {
        const notesDirPath = path.join("public", "uploads", "notes");

        try {
            await fs.access(notesDirPath);
        } catch (error) {
            await fs.mkdir(notesDirPath, { recursive: true });
        }

        const files = await fs.readdir(notesDirPath);
        const notes = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(notesDirPath, file);
                const content = await fs.readFile(filePath, "utf-8");
                return { title: file.replace(".txt", ""), content, path: filePath };
            })
        );

        res.render("notes/notes", {
            title: "Нотатки",
            notes,
        });
    } catch (error) {
        console.error("Помилка під час перегляду нотаток:", error);
        res.status(500).render('error', { message: "Помилка під час перегляду нотаток" });
    }
};
exports.notesCreatePost = async (req, res) => {
    try {
        const { title, content } = req.body
        if (!title) {
            return res.status(400).render('error', { message: "Заголовок не може бути порожнім" });
        }
        if (!content) {
            return res.status(400).render('error', { message: "Зміст не може бути порожнім" });
        }

        const notesDirPath = path.join("public", "uploads", "notes");

        const noteFilePath = path.join(notesDirPath, `${title}.txt`)
        await fs.writeFile(noteFilePath, content, 'utf-8')

        res.redirect("/notes")
    } catch (error) {
        console.error("Помилка при додаванні нотатки:", error);
        res.status(500).render('error', { message: "Помилка при додаванні нотатки" });
    }
};
exports.notedEditGet = async (req, res) => {
    try {
        const { title } = req.query;
        if (!title) {
            return res.status(400).send("Ім'я файлу не вказано");
        }

        const filePath = path.join("public", "uploads", "notes", `${title}.txt`);

        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).send("Файл не знайдено");
        }

        const content = await fs.readFile(filePath, "utf-8");

        res.render("notes/notesEdit", {
            title,
            content,
            path: filePath,
            isLoggedIn: true,
            isShowAuthButtons: true,
        })
    } catch (error) {
        console.error("Помилка під час редагування нотатки:", error);
        res.status(500).render('error', { message: "Помилка під час редагування нотатки" });
    }
};
exports.notedEditPut = async (req, res) => {
    try {
        const { oldTitle, title, content } = req.body;

        const notesDirPath = path.join("public", "uploads", "notes");
        const oldFilePath = path.join(notesDirPath, `${oldTitle}.txt`);

        let newFilePath = oldFilePath;
        if (title && title !== "") {
            newFilePath = path.join(notesDirPath, `${title}.txt`);
        }

        try {
            await fs.access(oldFilePath);
        } catch {
            return res.status(404).render('error', { message: "Файл не знайдено" });
        }

        if (oldTitle !== title && title !== "") {
            await fs.rename(oldFilePath, newFilePath);
        }

        await fs.writeFile(newFilePath, content, "utf-8");

        res.redirect("/notes");
    } catch (error) {
        console.error("Помилка під час редагування нотатки", error);
        res.status(500).render('error', { message: "Помилка під час редагування нотатки" });
    }
};
exports.notedDelete = async (req, res) => {
    try {
        const { title } = req.body;

        const notesDirPath = path.join("public", "uploads", "notes");
        const filePath = path.join(notesDirPath, `${title}.txt`);

        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).render('error', { message: "Файл не знайдено" });
        }

        await fs.unlink(filePath);

        res.redirect("/notes")
    } catch (error) {
        console.error("Помилка при видаленні нотатки:", error);
        res.status(500).render('error', { message: "Помилка при видаленні нотатки" });
    }
};
exports.notedDownloadPost = async (req, res) => {
    try {
        const { title } = req.query
        if (!title) {
            return res.status(400).send("Ім'я файлу не вказано");
        }

        const filePath = path.join("public", "uploads", "notes", `${title}.txt`)
        try {
            await fs.access(filePath)
        } catch (error) {
            return res.status(404).render('error', { message: "Файл не знайдено" });
        }

        res.download(filePath, path.basename(filePath), (err) => {
            if (err) {
                res.status(500).render('error', { message: "Помилка при завантаженні нотатки" });
            }
        })
    } catch (error) {
        console.error("Помилка при завантаженні нотатки:", error);
        res.status(500).render('error', { message: "Помилка при завантаженні нотатки" });
    }
};
exports.notedUploadPost = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).render('error', { message: 'Файл не був завантажений' });
        }

        res.redirect("/notes");
    } catch (error) {
        console.error("Помилка при завантаженні на сервер нотатки:", error);
        res.status(500).render('error', { message: "Помилка при завантаженні на сервер нотатки" });
    }
};