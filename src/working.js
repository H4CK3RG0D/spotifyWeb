require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');


const app = express();
const port = 8181;

const spotifyApi = new spotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

app.get('/login', (req, res) => {
   const scopes = ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-modify-playback-state'];
   res.redirect(spotifyApi.createAuthorizeURL(scopes));
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


app.get('/search', (req, res) => {
    const {q} = req.query;
    spotifyApi.searchTracks(q).then(searchedData => {
        const trackUri = searchedData.body.tracks.items[0].uri;
        res.send({uri:trackUri});
    }).catch(error => {
        console.error('Error searching:', error);
        res.send(`Error searching: ${error}`);
    });
       
});

app.get('/play', (req, res) => {
    const { uri } = req.query;
    spotifyApi.play({uris: [uri]}).then(() => {
        res.send('Playing');
    }).catch(error => {
        console.error('Error playing:', error);
        res.send(`Error playing: ${error}`);
    });
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}/login`);
});