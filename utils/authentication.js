export default function hasAuthentication(socket, next) {
    if (socket.request.session && socket.request.session.user && socket.request.session.user.email) {
        next();
    } else {
        socket.emit("unauthorized", {message: 'You are not authenticated.'});
    }
};
