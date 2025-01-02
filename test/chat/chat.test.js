const request = require("supertest");
const { Server } = require("socket.io");
const http = require("http");
const app = require("../../index");
const server = http.createServer(app);
const socketClient = require("socket.io-client");
const chai = require("chai");
const expect = chai.expect;
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server")
const User = require("../../models/Auth/User")


let mongoServer
let user
let cookies
let newUser
let newCookies
let io;

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
describe("Тест чату", () => {
    before(async () => {
        if (process.env.NODE_ENV === "test") {
            mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            if (mongoose.connection.readyState === 0) {
                await mongoose.connect(uri);
            }
        }
        io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });

        io.on("connection", (socket) => {
            console.log(`Нове з'єднання: ${socket.id}`);

            socket.on("chatMessage", (data) => {
                console.log("Повідомлення отримано на сервері:", data);
                const { user, message } = data;
                console.log(`Повідомлення від ${user}: ${message}`);
                io.emit("chatMessage", { user, message });
            });

            socket.on("disconnect", () => {
                console.log(`Користувач відключився: ${socket.id}`);
            });
        });

        server.listen(3001, () => {
            console.log("Тест сервер запустився на PORT: 3001");
        });

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
        await User.deleteMany();
    });

    after(async () => {
        await mongoose.connection.close();
        await mongoServer.stop();

        io.close();
        server.close(() => {
            console.log("Сервер закрився");
        });
    });
    describe("Тест чату", () => {
        it("Повинен відкрити сторінку чату лише для авторизованих користувачів", async function () {
            const authResponse = await request(app)
                .get("/chat")
                .set('Cookie', cookies);

            const dontAuthResponse = await request(app)
                .get("/chat");

            expect(authResponse.status).to.equal(200);
            expect(authResponse.text).to.include("Ласкаво просимо");

            expect(dontAuthResponse.status).to.equal(302);
            expect(dontAuthResponse.headers.location).to.equal("/auth/login");
        });
        it("Повинен надсилати повідомлення всім підключеним користувачам", async () => {
            const socketUser1 = socketClient(`http://localhost:${server.address().port}`);
            const socketUser2 = socketClient(`http://localhost:${server.address().port}`);

            socketUser1.emit("User", user.username);
            socketUser2.emit("newUser", newUser.username);

            await new Promise((resolve) => {
                socketUser1.on("connect", resolve);
            });

            await new Promise((resolve, reject) => {
                socketUser2.on("chatMessage", (data) => {
                    try {
                        expect(data.user).to.equal(user.username);
                        expect(data.message).to.equal("Тест повідомлення всім");
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                });

                socketUser1.emit("chatMessage", { user: user.username, message: "Тест повідомлення всім" });
            });
        });
    })
})