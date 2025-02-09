const express = require('express');
const spotifyApi = req.app.locals.spotifyApi;
const router = express.Router();

router.get('/save-liked-songs', async (req, res) => {
    try {
        let offset = 0;
        const limit = 50;
        let likedSongs = [];

        while (true) {
            const data = await spotifyApi.getMySavedTracks({ limit, offset });
            likedSongs = likedSongs.concat(
                data.body.items.map(item => ({
                    name: item.track.name,
                    artist: item.track.artists.map(artist => artist.name).join(', '),
                    album: item.track.album.name,
                    image: item.track.album.images[0]?.url,
                    addedAt: item.added_at,
                    popularity: item.track.popularity,
                    uri: item.track.uri
                }))
            );
            if (data.body.items.length < limit) break;
            offset += limit;
        }

        fs.writeFileSync('liked-songs.json', JSON.stringify({ likedSongs }, null, 2));
        res.send('Liked songs saved to liked-songs.json');
    } catch (error) {
        console.error('Error saving liked songs:', error);
        res.status(500).send('Failed to save liked songs');
    }
});

module.exports = router;