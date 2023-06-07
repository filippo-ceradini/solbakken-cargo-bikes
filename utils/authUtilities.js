function socketAuthentication(socket, next) {
    if (socket.request.session && socket.request.session.user) {
        return next();
    }
    socket.emit("log-messages", {
        status: 401,
        message: "You are not authenticated"
    });
    socket.disconnect();
}

function socketAuthorization(socket, next) {
    if (socket.request.session && socket.request.session.user.isAdmin) {
        return next();
    }
    socket.emit("log-messages", {
        status: 401,
        message: "Unauthorized"
    });
    socket.disconnect();
}

function expressAuthentication(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.status(401).send({
        status: 401,
        message: "You are not authenticated"
    });
}

function expressAuthorization(req, res, next) {
    if (req.session && req.session.user.isAdmin) {
        return next();
    }
    res.status(401).send({
        status: 401,
        message: "Unauthorized"
    });
}

export { socketAuthentication, socketAuthorization, expressAuthentication, expressAuthorization };