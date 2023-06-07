export default function isAuthenticated(socket, next) {
    if (socket.request.session && socket.request.session.user) { // Assuming 'user' is part of your session when authenticated
        return next();
    }
    socket.emit("log-messages", {
        status: 401,
        message: "Unauthorized"
    });
    socket.disconnect();
}