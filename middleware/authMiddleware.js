<<<<<<< HEAD
const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.Role !== 'Admin') return res.status(403).json({ message: 'Access denied' });
    next();
};

module.exports = { authenticateUser, authorizeAdmin };
=======
const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.Role !== 'Admin') return res.status(403).json({ message: 'Access denied' });
    next();
};

module.exports = { authenticateUser, authorizeAdmin };
>>>>>>> d148a6cbb52ceadea0bd3e901cc07344e61d13c4
