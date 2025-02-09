const express = require('express');
const router = express.Router();


router.get('/search-query', (req, res) => {
    const spotifyApi = req.spotifyApi;
    const { q } = req.query;
    spotifyApi.searchTracks(q).then(searchedData => {
        const tracks = searchedData.body.tracks.items;
        res.json(tracks.length > 0 ? tracks[0] : { error: 'No tracks found' });
    }).catch(error => {
        console.error('Error searching:', error);
        res.json(`{ error: Error searching: ${error} }`);
    });
});

module.exports = router;