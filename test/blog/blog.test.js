const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../index");
const { MongoMemoryServer } = require("mongodb-memory-server");
const chai = require("chai");
const expect = chai.expect;
const path = require("path");
require('dotenv').config({ path: '.env.test' });
const User = require("../../models/Auth/User");
const Blog = require("../../models/Blog/Blog");
const Comment = require("../../models/Blog/Comment");

let mongoServer;
let server;
let cookies;
let newCookies;
let user;

const addTestBlog = async () => {
    const blog = new Blog({
        title: "Тест блог",
        description: "Тест опис блога",
        user: user._id,
        img: "/uploads/dontImg.jpeg",
    });
    await blog.save();
    return blog
}
const addTestComment = async (blog) => {
    const comment = new Comment({
        text: "Тест коментар",
        user: user._id,
        blog: blog._id
    });
    await comment.save();
    return comment
}

const registerTestUser = async (username, password) => {
    return await request(app)
        .post("/auth/register")
        .send({ username, password })
}
const loginTestUser = async (username, password) => {
    return await request(app)
        .post("/auth/login")
        .send({ username, password })
}

describe("Тест блога", () => {
    before(async () => {
        if (process.env.NODE_ENV === "test") {
            mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            if (mongoose.connection.readyState === 0) {
                await mongoose.connect(uri);
            }
        }
        server = app.listen(3001, () => {
            console.log('Тест сервер запустився на PORT: 3001');
        })

        await registerTestUser("testuser", "testpassword")
        const loginTest = await loginTestUser("testuser", "testpassword")
        cookies = loginTest.headers['set-cookie']
        user = await User.findOne({ username: "testuser" })

        await registerTestUser("newtestuser", "newtestpassword")
        const newUserLogin = await loginTestUser("newtestuser", "newtestpassword")
        newCookies = newUserLogin.headers['set-cookie']
        newUser = await User.findOne({ username: "newtestuser" })
    });

    beforeEach(async () => {
        await Blog.deleteMany();
        await Comment.deleteMany();
    });

    after(async () => {
        server.close();
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    describe("GET /blog", () => {
        it("Повинен повернути всі блоги", async () => {
            await addTestBlog()

            const response = await request(app)
                .get("/blog");

            expect(response.status).to.equal(200);
            expect(response.text).to.include("Тест блог");
        });
    });
    describe("GET /blog/create", () => {
        it("Повинен повернути сторінку з формою створення блогу", async () => {
            const response = await request(app).get("/blog/create");

            expect(response.status).to.equal(200);
            expect(response.text).to.include('form');
            expect(response.text).to.include('title');
            expect(response.text).to.include('description');
            expect(response.text).to.include('blogImage');
        });
    });
    describe("POST /blog/create", () => {
        it("Повинен успішно створити новий блог із зображенням дефолтним", async () => {
            const response = await request(app)
                .post("/blog/create")
                .set('Cookie', cookies)
                .field("title", "Тест блог")
                .field("description", "Тест опис блога")
                .attach("blogImage", path.resolve(__dirname, "../../public/uploads/dontImg.jpeg"));

            expect(response.status).to.equal(302);
            expect(response.header.location).to.equal("/blog");
        })
        it("Повинен успішно створити новий блог із завантаженим зображенням", async () => {
            const response = await request(app)
                .post("/blog/create")
                .set('Cookie', cookies)
                .field("title", "Тест блог")
                .field("description", "Тест опис блога")
                .attach("blogImage", path.resolve(__dirname, "../../test/test-image.jpg"));

            const blog = await Blog.findOne({ title: "Тест блог" });
            expect(blog).to.exist;
            expect(blog.img).to.include("uploads/blogs");

            expect(response.status).to.equal(302);
            expect(response.header.location).to.equal("/blog");
        })
        it("Повинен повернути 400, якщо дані не пройшли перевірку", async () => {
            const response = await request(app)
                .post("/blog/create")
                .set("Cookie", cookies)
                .field("title", "")
                .field("description", "Тест опис блога");

            expect(response.status).to.equal(400);
            expect(response.text).to.include("Заповніть поле титула");
        });
        it("Повинен повернути 403, якщо користувач не авторизований", async () => {
            const response = await request(app)
                .post("/blog/create")
                .field("title", "Тест блог")
                .field("description", "Тест опис блога")
                .attach("blogImage", path.resolve(__dirname, "../../public/uploads/dontImg.jpeg"));

            expect(response.status).to.equal(403);
            expect(response.text).to.include("Неавторизований доступ до захищеного маршруту");
        });
        it("Повинен повернути 409, якщо блог під час створення, з цим титулом вже існує", async () => {
            await request(app)
                .post("/blog/create")
                .set("Cookie", cookies)
                .field("title", "Тест блог")
                .field("description", "Тест опис блога")
                .attach("blogImage", path.resolve(__dirname, "../../public/uploads/dontImg.jpeg"));

            const response = await request(app)
                .post("/blog/create")
                .set("Cookie", cookies)
                .field("title", "Тест блог")
                .field("description", "Новое тест опис блога")
                .attach("blogImage", path.resolve(__dirname, "../../public/uploads/dontImg.jpeg"));

            expect(response.status).to.equal(409);
            expect(response.text).to.include("Блог з цим тітулом вже існує");
        });
    });
    describe("GET /blog/:id", () => {
        it("Повинен повернути сторінку з блогом за ID", async () => {
            const blog = await addTestBlog()
            const blogId = blog._id.toString()

            await addTestComment(blog)
            const blogComments = await Comment.find({ blog: blog._id });

            const response = await request(app)
                .get(`/blog/${blogId}`)
                .set('Cookie', cookies);

            expect(response.status).to.equal(200);
            expect(response.text).to.include("Тест блог");
            expect(response.text).to.include("Тест опис");
            expect(response.text).to.include('<img class="blog-image" src="/uploads/dontImg.jpeg"');
            expect(response.text).to.include('Залиште коментар:');
            if (blogComments.length > 0) {
                expect(response.text).to.include("Тест коментар");
                expect(response.text).to.include(user.username);
            } else {
                expect(response.text).to.include("Немає коментарів");
            }
        });
        it("Повинен повернути 404, якщо блог не знайдено", async () => {
            const blogIdTest = "123456789012345678901234"

            const response = await request(app)
                .get(`/blog/${blogIdTest}`)
                .set('Cookie', cookies)

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Блог не знайдено");
        });
    });
    describe("DELETE /blog/delete/:id", () => {
        it("Повинен успішно видалити блог, якщо користувач є власником", async () => {
            const blog = await addTestBlog()
            const blogId = blog._id.toString()

            const response = await request(app)
                .delete(`/blog/delete/${blogId}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(302);
            expect(response.header.location).to.equal("/blog");
        });
        it("Повинен повернути 403, якщо користувач не є власником блогу", async () => {
            const blog = await addTestBlog()
            const blogId = blog._id.toString()

            const response = await request(app)
                .delete(`/blog/delete/${blogId}`)
                .set("Cookie", newCookies);

            expect(response.status).to.equal(403);
            expect(response.text).to.include("Ви не можете видалити цей блог");
        });
        it("Повинен повернути 404, якщо блог не знайдено", async () => {
            const blogIdTest = "123456789012345678901234"

            const response = await request(app)
                .delete(`/blog/delete/${blogIdTest}`)
                .set('Cookie', cookies)

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Блог не знайдено");
        });
    });
    describe("GET /blog/edit/:id", () => {
        it("Повинен повернути сторінку з формою редагування блогу", async () => {
            const blog = await addTestBlog()
            const blogId = blog._id.toString()

            const response = await request(app)
                .get(`/blog/edit/${blogId}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(200);
            expect(response.text).to.include('<form');
            expect(response.text).to.include('name="title"');
            expect(response.text).to.include(blog.title);
            expect(response.text).to.include('name="description"');
            expect(response.text).to.include(blog.description);
            expect(response.text).to.include('name="blogImage"');
        });
        it("Повинен повернути 404, якщо блог не знайдено", async () => {
            const blogIdTest = "123456789012345678901234";

            const response = await request(app)
                .get(`/blog/edit/${blogIdTest}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Блог не знайдено");
        });
    });
    describe("PUT /blog/edit/:id", () => {
        it("Повинен успішно оновити блог, якщо користувач є власником", async () => {
            const blog = await addTestBlog()
            const blogId = blog._id.toString()

            const updateTitle = "Новий тест блог"
            const updateDescription = "Новий тест опис блогу"

            const response = await request(app)
                .put(`/blog/edit/${blogId}`)
                .set("Cookie", cookies)
                .field("title", updateTitle)
                .field("description", updateDescription)
                .attach("blogImage", path.resolve(__dirname, "../../public/uploads/dontImg.jpeg"))

            expect(response.status).to.equal(302)
            expect(response.header.location).to.equal(`/blog/${blogId}`)

            const updateBlog = await Blog.findById(blogId)
            expect(updateBlog.title).to.equal(updateTitle)
            expect(updateBlog.description).to.equal(updateDescription)
        })
        it("Повинен повернути 400, якщо дані не пройшли перевірку", async () => {
            const blog = await addTestBlog()
            const blogId = blog._id.toString()

            const response = await request(app)
                .put(`/blog/edit/${blogId}`)
                .set("Cookie", cookies)
                .field("title", "")
                .field("description", "Нове тест опис блога")

            expect(response.status).to.equal(400)
            expect(response.text).to.include("Заповніть поле титула")
        })
        it("Повинен повернути 403, якщо користувач не є власником блогу", async () => {
            const blog = await addTestBlog()
            const blogId = blog._id.toString()

            const editTitle = "Новий тест блог"

            const response = await request(app)
                .put(`/blog/edit/${blogId}`)
                .set("Cookie", newCookies)
                .field("title", editTitle)

            expect(response.status).to.equal(403)
            expect(response.text).to.include("Ви не можете змінити цей блог")
        })
        it("Повинен повернути 404, якщо блог не знайдено", async () => {
            const blogIdTest = "123456789012345678901234";

            const response = await request(app)
                .put(`/blog/edit/${blogIdTest}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Блог не знайдено");
        })
    })
    describe("POST /blog/comment/:id", () => {
        it("Повинен успішно створити новий коментар", async () => {
            const blog = await addTestBlog();
            const blogId = blog._id.toString()

            const response = await request(app)
                .post(`/blog/comment/${blogId}`)
                .set("Cookie", cookies)
                .send({ text: "Тест коментар" });

            expect(response.status).to.equal(302);
            expect(response.header.location).to.equal(`/blog/${blogId}`);

            const comment = await Comment.findOne({ blog: blogId, text: "Тест коментар" });
            expect(comment).to.not.be.null;
            expect(comment.user.toString()).to.equal(user._id.toString());
        });
        it("Повинен повернути 400, якщо текст коментаря не пройшов перевірку", async () => {
            const blog = await addTestBlog();
            const blogId = blog._id.toString()

            const response = await request(app)
                .post(`/blog/comment/${blogId}`)
                .set("Cookie", cookies)
                .send({ text: "", });

            expect(response.status).to.equal(400);
            expect(response.text).to.include("Заповніть текст для коментаря");
        });
        it("Повинен повернути 403, якщо користувач не авторизований", async () => {
            const blog = await addTestBlog();
            const blogId = blog._id.toString()

            const response = await request(app)
                .post(`/blog/comment/${blogId}`)
                .send({ text: "Тест коментар" });

            expect(response.status).to.equal(403);
            expect(response.text).to.include("Неавторизований доступ до захищеного маршруту");
        });
        it("Повинен повернути 404, якщо блог не знайдено", async () => {
            const blogIdTest = "123456789012345678901234"

            const response = await request(app)
                .post(`/blog/comment/${blogIdTest}`)
                .set("Cookie", cookies)
                .send({ text: "Тест коментар", });

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Блог не знайдено");
        });
    })
    describe("GET /blog/comment/:id/:commentId", () => {
        it("Повинен повернути сторінку з формою редагування коментарів", async () => {
            const blog = await addTestBlog();
            const blogId = blog._id.toString();

            const comment = await addTestComment(blog);
            const commentId = comment._id.toString();

            const response = await request(app)
                .get(`/blog/comment/${blogId}/${commentId}`)
                .set("Cookie", cookies)

            expect(response.status).to.equal(200);
            expect(response.text).to.include("Відредагуйте коментар");
            expect(response.text).to.include(comment.text);
        });
        it("Повинен повернути 404, якщо блог не знайдено", async () => {
            const blogIdTest = "123456789012345678901234";
            const commentIdTest = "123456789012345678901234";

            const response = await request(app)
                .get(`/blog/comment/${blogIdTest}/${commentIdTest}`)
                .set("Cookie", cookies)

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Блог не знайдено");
        });
        it("Повинен повернути 404, якщо коментар не знайдено", async () => {
            const blog = await addTestBlog();
            const blogId = blog._id.toString();

            const commentIdTest = "123456789012345678901234";

            const response = await request(app)
                .get(`/blog/comment/${blogId}/${commentIdTest}`)
                .set("Cookie", cookies)

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Коментар не знайдено");
        });
    })
    describe("PUT /blog/comment/:id/:commentId", () => {
        it("Повинен успішно редагувати коментар", async () => {
            const blog = await addTestBlog();
            const blogId = blog._id.toString();

            const comment = await addTestComment(blog);
            const commentId = comment._id.toString();

            const updatedText = "Тест коментар оновлено";

            const response = await request(app)
                .put(`/blog/comment/${blogId}/${commentId}`)
                .set("Cookie", cookies)
                .send({ text: updatedText });

            expect(response.status).to.equal(302);
            expect(response.header.location).to.equal(`/blog/${blogId}`);

            const updatedComment = await Comment.findById(commentId);
            expect(updatedComment.text).to.equal(updatedText);
        });
        it("Повинен повернути 400, якщо текст коментаря не пройшов перевірку", async () => {
            const blog = await addTestBlog();
            const blogId = blog._id.toString();

            const comment = await addTestComment(blog);
            const commentId = comment._id.toString();

            const response = await request(app)
                .put(`/blog/comment/${blogId}/${commentId}`)
                .set("Cookie", cookies)
                .send({ text: "" });

            expect(response.status).to.equal(400);
            expect(response.text).to.include("Заповніть текст для коментаря");
        });
        it("Повинен повернути 404, якщо блог не знайдено", async () => {
            const blogIdTest = "123456789012345678901234";
            const commentIdTest = "123456789012345678901234";

            const response = await request(app)
                .put(`/blog/comment/${blogIdTest}/${commentIdTest}`)
                .set("Cookie", cookies)
                .send({ text: "Тест коментар оновлено" });

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Блог не знайден");
        });
        it("Повинен повернути 404, якщо коментар не знайдено ", async () => {
            const blog = await addTestBlog();
            const blogId = blog._id.toString();

            const commentIdTest = "123456789012345678901234";

            const response = await request(app)
                .put(`/blog/comment/${blogId}/${commentIdTest}`)
                .set("Cookie", cookies)
                .send({ text: "Тест коментар оновлено" });

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Коментар не знайдено");
        });
    });
    describe("DELETE /blog/comment/:id/:commentId", () => {
        it("Повинен успішно видалити коментар", async () => {
            const blog = await addTestBlog();
            const blogId = blog._id.toString();

            const comment = await addTestComment(blog);
            const commentId = comment._id.toString();

            const response = await request(app)
                .delete(`/blog/comment/${blogId}/${commentId}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(302);
            expect(response.header.location).to.equal(`/blog/${blogId}`);

            const deletedComment = await Comment.findById(commentId);
            expect(deletedComment).to.be.null;

            const updatedBlog = await Blog.findById(blogId);
            expect(updatedBlog.comments).to.not.include(commentId);
        });
        it("Повинен повернути 404, якщо блог не знайдено", async () => {
            const blogIdTest = "123456789012345678901234";
            const commentIdTest = "123456789012345678901234";

            const response = await request(app)
                .delete(`/blog/comment/${blogIdTest}/${commentIdTest}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Блог не знайдено");
        });
        it("Повинен повернути 404, якщо коментар не знайдено", async () => {
            const blog = await addTestBlog();
            const blogId = blog._id.toString();

            const commentIdTest = "123456789012345678901234";

            const response = await request(app)
                .delete(`/blog/comment/${blogId}/${commentIdTest}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Коментар не знайдено");
        });
    });
});
