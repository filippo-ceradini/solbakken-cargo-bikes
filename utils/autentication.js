export default function hasAuthentication(req, res, next) {
    if (req.session && req.session.user && req.session.user.email) {
        next();
    } else {
        res.status(401).send('You are not authenticated.');
    }
};