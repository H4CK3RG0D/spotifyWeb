require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8181;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

app.locals.spotifyApi = spotifyApi;

app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'search.html'));
});

app.get('/login', (req, res) => {
    const scopes = [
        'user-read-private', 
        'user-read-email', 
        'user-read-playback-state', 
        'user-modify-playback-state', 
        'user-top-read', 
        'user-read-recently-played',
        'user-library-read',
        'playlist-modify-private',
        'playlist-modify-public'
        ];

    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);   
    // console.log(authorizeURL);
    res.redirect(authorizeURL);
 });

 app.get('/logout', (req, res) => {
    try {
        // Clear the access and refresh tokens
        spotifyApi.setAccessToken(null);
        spotifyApi.setRefreshToken(null);

        res.status(200).json({ message: 'Successfully logged out' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Failed to log out', details: error.message });
    }
});


 app.get('/callback', async (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;

    if (error) {
        console.error('Callback error:', error);
        res.send(`Callback error: ${error}`);
        return;
    }

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const accessToken = data.body['access_token'];
        const refreshToken = data.body['refresh_token'];
        const expiresIn = data.body['expires_in'];

        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        setInterval(async () => {
            const data = await spotifyApi.refreshAccessToken();
            const newAccessToken = data.body['access_token'];
            spotifyApi.setAccessToken(newAccessToken);
        }, (expiresIn / 2) * 1000);

        // Redirect to search.html
        res.redirect('/');
    } catch (error) {
        console.error('Error getting Tokens:', error);
        res.send(`Error getting Tokens: ${error}`);
    }
});


    app.get('/search-query', (req, res) => {
        const { q } = req.query;
        spotifyApi.searchTracks(q).then(searchedData => {
            const tracks = searchedData.body.tracks.items;
            res.json(tracks.length > 0 ? tracks[0] : { error: 'No tracks found' });
        }).catch(error => {
            console.error('Error searching:', error);
            res.json(`{ error: Error searching: ${error} }`);
        });
    });


 
    
    // const monthlyThemes = {
    //     January: { energy: [0.4, 0.6], valence: [0.4, 0.6] }, // Medium Energy (balanced mood)
    //     February: { energy: [0.2, 0.4], valence: [0.3, 0.5] }, // Love/slow tempo; ballads
    //     March: { energy: [0.3, 0.5], valence: [0.4, 0.7] }, // Relaxed
    //     April: { energy: [0.2, 0.4], valence: [0.2, 0.5] }, // Love/Heartbreak
    //     May: { energy: [0.7, 1.0], valence: [0.5, 0.8] }, // Fast Tempo/High Energy
    //     June: { energy: [0.4, 0.6], valence: [0.5, 0.7] }, // Nostalgic
    //     July: { energy: [0.5, 0.7], valence: [0.6, 0.8] }, // Hopeful
    //     August: { energy: [0.2, 0.4], valence: [0.1, 0.4] }, // Sad
    //     September: { energy: [0.3, 0.5], valence: [0.2, 0.5] }, // Moody
    //     October: { energy: [0.4, 0.6], valence: [0.4, 0.6] }, // Medium Energy (balanced mood)
    //     November: { energy: [0.3, 0.5], valence: [0.2, 0.5] }, // Dark/Joyful
    //     December: { energy: [0.4, 0.7], valence: [0.5, 0.8] }, // Christmas/Cheerful
    // };

    
    
    app.listen(port, () => {
        console.log(`Server started on http://localhost:${port}/login`);
    });