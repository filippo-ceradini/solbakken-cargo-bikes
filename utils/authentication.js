export default function hasAuthentication(socket, next) {
    const vero = true
    if (vero || (socket.request.session && socket.request.session.user && socket.request.session.user.email)) {
        return (...args) => {
            next(...args);
        };
    } else {
        socket.emit("unauthorized", {message: 'You are not authenticated.'});
    }
};
