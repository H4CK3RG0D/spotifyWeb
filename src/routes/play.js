const express = require('express');
const spotifyApi = req.app.locals.spotifyApi;
const router = express.Router();

router.get('/play', (req, res) => {
    const { uri } = req.query;

    spotifyApi.play({ uris: [uri] })
        .then(() => {
            // Send success message or redirect to the play page
            res.sendFile(path.join(process.cwd(), 'views', 'search.html'));
        })
        .catch(error => {
            console.error('Error playing:', error);
            res.send(`Error playing: ${error}`);
        });
});

module.exports = router;