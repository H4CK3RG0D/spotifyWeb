// src/routes/auth.js
const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    const spotifyApi = req.spotifyApi;
    const scopes = [
        'user-read-private', 'user-read-email',
        'user-read-playback-state', 'user-modify-playback-state',
        'user-top-read', 'user-read-recently-played',
        'user-library-read', 'playlist-modify-private',
        'playlist-modify-public'
    ];
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    res.redirect(authorizeURL);
});

router.get('/logout', (req, res) => {
    const spotifyApi = req.spotifyApi;
    try {
        spotifyApi.setAccessToken(null);
        spotifyApi.setRefreshToken(null);
        res.status(200).json({ message: 'Successfully logged out' });
    } catch (error) {
        console.error('❌ Error during logout:', error);
        res.status(500).json({ error: 'Failed to log out', details: error.message });
    }
});

router.get('/callback', async (req, res) => {
    const spotifyApi = req.spotifyApi;
    const error = req.query.error;
    const code = req.query.code;

    if (error) {
        console.error('❌ Callback error:', error);
        return res.status(400).send(`Callback error: ${error}`);
    }

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);

        console.log(`✅ Access Token Set: Expires in ${data.body['expires_in']}s`);

        setInterval(async () => {
            try {
                const refreshData = await spotifyApi.refreshAccessToken();
                spotifyApi.setAccessToken(refreshData.body['access_token']);
                console.log('🔄 Access token refreshed.');
            } catch (refreshError) {
                console.error('❌ Error refreshing access token:', refreshError);
            }
        }, (data.body['expires_in'] / 2) * 1000);

        res.redirect('/');
    } catch (error) {
        console.error('❌ Error getting tokens:', error);
        res.status(500).send(`Error getting tokens: ${error.message}`);
    }
});

module.exports = router;
