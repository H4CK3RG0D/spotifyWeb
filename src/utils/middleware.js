// utils/middleware.js
const spotifyMiddleware = (req, res, next) => {
    if (!req.app.locals.spotifyApi) {
        console.error('❌ Spotify API instance is missing.');
        return res.status(500).json({ error: 'Spotify API is not initialized' });
    }
    req.spotifyApi = req.app.locals.spotifyApi;
    next();
};

module.exports = spotifyMiddleware ;
