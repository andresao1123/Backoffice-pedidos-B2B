export const internalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log(authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    console.log(token);

    if (token !== process.env.SERVICE_TOKEN) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    next();
};
