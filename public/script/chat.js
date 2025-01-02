const socket = io()

const messageInput = document.getElementById("messageInput")
const sendButton = document.getElementById("sendButton")
const chatMessages = document.getElementById("chatMessages")

const userName = document.querySelector(".chat-container").getAttribute("data-username");

sendButton.addEventListener("click", () => {
    const message = messageInput.value.trim();
    console.log("Надсилання повідомлення:", message);
    if (message) {
        socket.emit("chatMessage", { user: userName, message });
        messageInput.value = "";
    }
});

socket.on("chatMessage", (data) => {
    console.log("Отримано повідомлення:", data);
    const { user, message } = data;
    const messageElement = document.createElement("div");
    messageElement.innerHTML = `<strong>${user}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});