const request = require("supertest");
const app = require("../../index");
const sinon = require("sinon");
const fs = require("fs").promises;
const path = require("path");
const chai = require("chai");
const expect = chai.expect;

describe("Тест нотаток", () => {

    let fsStub;

    beforeEach(() => {
        fsStub = sinon.stub(fs, "access");
        sinon.stub(fs, "readFile").resolves("Тест зміст");
        sinon.stub(fs, "readdir").resolves(["test.txt"]);
        sinon.stub(fs, "writeFile").resolves();
        sinon.stub(fs, "unlink").resolves();
        sinon.stub(fs, "rename").resolves();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("GET /notes", () => {
        it("Повинен повернути сторінку з нотатками та містити заголовки нотаток", async () => {
            const response = await request(app)
                .get("/notes");

            expect(response.status).to.equal(200);
            expect(response.text).to.include('Завантажити нотатку');
            expect(response.text).to.include('Створити нотатку');
            expect(response.text).to.include('Список нотаток');
        });
    });
    describe("POST /notes/create", () => {
        it("Повинен створити нотатку", async () => {
            const response = await request(app)
                .post("/notes/create")
                .send({
                    title: "Тест назва",
                    content: "Тест зміст"
                });

            expect(response.status).to.equal(302);
            expect(response.header.location).to.equal("/notes");

            const filePath = path.join("public", "uploads", "notes", "Тест назва.txt");
            expect(fs.writeFile.calledWith(filePath, "Тест зміст", 'utf-8')).to.be.true;
        });
    });
    describe("GET /notes/edit", () => {
        it("Повинен повернути сторінку редагування нотатки", async () => {
            const response = await request(app)
                .get("/notes/edit?title=test");

            expect(response.status).to.equal(200);
            expect(response.text).to.include('Редагування нотатки');
            expect(response.text).to.include('Назва');
            expect(response.text).to.include('Зміст');
        });
    });
    describe("PUT /notes/edit", () => {
        it("Повинен відредагувати нотатку", async () => {
            const response = await request(app)
                .put("/notes/edit")
                .send({
                    oldTitle: "Тест назва",
                    title: "Тест нова назва",
                    content: "Тест оновлений зміст"
                });

            expect(response.status).to.equal(302);
            expect(response.header.location).to.equal("/notes");

            const oldFilePath = path.join("public", "uploads", "notes", "Тест назва.txt");
            const newFilePath = path.join("public", "uploads", "notes", "Тест нова назва.txt");

            expect(fs.rename.calledWith(oldFilePath, newFilePath)).to.be.true;
            expect(fs.writeFile.calledWith(newFilePath, "Тест оновлений зміст", "utf-8")).to.be.true;
        });
    });
    describe("DELETE /notes/delete", () => {
        it("Повинен видалити нотатку", async () => {
            const response = await request(app)
                .delete("/notes/delete")
                .send({
                    title: "Тест назва"
                });

            expect(response.status).to.equal(302);
            expect(response.header.location).to.equal("/notes");
            const filePath = path.join("public", "uploads", "notes", "Тест назва.txt");

            expect(fs.unlink.calledWith(filePath)).to.be.true;
        });
    });
    describe("GET /notes/download", () => {
        it("Повинен скачати файл", async () => {
            const response = await request(app)
                .get("/notes/download")
                .query({ title: "Тест назва" });

            expect(response.status).to.equal(200);
            expect(response.headers["content-disposition"]).to.match(/attachment/);
        });
    });
    describe("POST /notes/upload", () => {
        it("Повинен завантажити файл", async () => {
            const filePath = path.join("public", "uploads", "notes", "Тест назва.txt");
            await fs.writeFile(filePath, "Тест зміст", 'utf-8');

            const response = await request(app)
                .post("/notes/upload")
                .attach("noteFile", filePath);

            expect(response.status).to.equal(302);
            expect(response.header.location).to.equal("/notes");
        });
    });
});
