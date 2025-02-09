const express = require('express');
const router = express.Router();

router.get('/test', async (req, res) => {
    const spotifyApi = req.spotifyApi;
    try{
        const trackIds = ['11dFghVXANMlKmJXsNCbNl', '3n3Ppam7vgaVa1iaRUc9Lp'];
    spotifyApi.getAudioFeaturesForTracks(trackIds)
        .then(data => console.log(data.body.audio_features))
        .catch(err => console.error('Error fetching audio features:', err));

    } catch (error) {
        console.error('Error:', error);
        res.send(`Error: ${error}`);
    }
});

module.exports = router;

