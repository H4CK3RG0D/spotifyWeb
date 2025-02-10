require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');
const spotifyMiddleware = require('./utils/middleware'); // Import middleware

const app = express();
const PORT = process.env.PORT || 8181;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

// Authenticate with Spotify
async function authenticateSpotify() {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body.access_token);
        console.log('✅ Spotify access token set.');
    } catch (error) {
        console.error('❌ Failed to authenticate Spotify API:', error);
    }
}

app.get('/', (req, res) => {
    res.redirect('/api/');
});

authenticateSpotify();
app.locals.spotifyApi = spotifyApi; 

app.use(spotifyMiddleware);

app.use(express.static(path.join(process.cwd(), 'public')));

const homeRoute = require('./routes/home'); 
app.use('/', homeRoute);

require('./utils/handler')(app);

app.listen(PORT, () => {
    console.log(`🚀 Server started at http://localhost:${PORT}/api/login`);
});
