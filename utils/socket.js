const { Server } = require("socket.io")

module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
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

    return io;
};