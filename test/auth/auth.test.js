const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const { expect } = require("chai");
const bcrypt = require("bcryptjs");
const app = require("../../index");
const User = require("../../models/Auth/User");

let mongoServer;

const addTestUser = async () => {
    const passwordHash = await bcrypt.hash("testpassword", 10);

    const user = new User({
        username: "testuser",
        password: passwordHash
    })
    await user.save()

    return user
}

describe("Тести авторизації", () => {
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
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    describe("GET /auth/register", () => {
        it("Повинен повернути сторінку з формою реєстрації", async () => {
            const response = await request(app)
                .get("/auth/register");

            expect(response.status).to.equal(200);
            expect(response.text).to.include('<form');
            expect(response.text).to.include("Реєстрація");
            expect(response.text).to.include('action="/auth/register"');
        });
    });
    describe("POST /auth/register", () => {
        it("Повинен успішно реєструвати користувача", async () => {
            const response = await request(app)
                .post("/auth/register")
                .send({ username: "testuser", password: "testpassword" });

            expect(response.status).to.equal(201);

            const user = await User.findOne({ username: "testuser" });
            expect(user).to.not.be.null;
            expect(user.username).to.equal("testuser");
        });
        it("Повинен повернути 400, якщо дані не пройшли перевірку", async () => {
            const response = await request(app)
                .post("/auth/register")
                .field("username", "")
                .field("password", "testpassword");

            expect(response.status).to.equal(400);
            expect(response.text).to.include("Логін повинен бути від 4 до 20 символів");
        });
        it("Повинен повернути 409, якщо такий користувач вже існує", async () => {
            await addTestUser()

            const response = await request(app)
                .post("/auth/register")
                .send({ username: "testuser", password: "testpassword" });

            expect(response.status).to.equal(409);
            expect(response.text).to.include("Такий користувач вже існує");
        });
    });
    describe("GET /auth/login", () => {
        it("Повинен повернути сторінку з формою входу", async () => {
            const responseponse = await request(app)
                .get("/auth/login");

            expect(responseponse.status).to.equal(200);
            expect(responseponse.text).to.include('<form');
            expect(responseponse.text).to.include("Вхід");
            expect(responseponse.text).to.include('action="/auth/login"');
        });
    });
    describe("POST /auth/login", () => {
        it("Повинен успішно реєструвати користувача", async () => {
            await addTestUser()

            const response = await request(app)
                .post("/auth/login")
                .send({ username: "testuser", password: "testpassword" });

            expect(response.status).to.equal(302);
            expect(response.headers["set-cookie"]).to.exist;
        });
        it("Повинен повернути 401, якщо пароль не правильний", async () => {
            await addTestUser()

            const response = await request(app)
                .post("/auth/login")
                .send({ username: "testuser", password: "testpassword123" });

            expect(response.status).to.equal(401);
            expect(response.text).to.include("Неправильний логін користувача або пароль");
        });
        it("Повинен повернути 401, якщо логін не правильне", async () => {
            await addTestUser()

            const response = await request(app)
                .post("/auth/login")
                .send({ username: "testuser123", password: "testpassword" });

            expect(response.status).to.equal(401);
            expect(response.text).to.include("Неправильний логін користувача або пароль");
        });
    });
    describe("GET /auth/logout", () => {
        it("Повинен успішно залишити логін", async () => {
            const response = await request(app)
                .get("/auth/logout");

            expect(response.status).to.equal(302);
            const cookies = response.headers["set-cookie"];
            expect(cookies).to.be.an("array").that.is.not.empty;

            const expiredCookie = cookies.find(cookie => cookie.includes('token='));
            expect(expiredCookie).to.include('token=;');
        });
    });
});
