const express = require('express');
const spotifyApi = req.app.locals.spotifyApi;
const router = express.Router();

router.get('/liked-songs', async (req, res) => {
    try {
        let offset = 0;
        const limit = 50; // Spotify's max limit per request
        let likedSongs = [];

        // Paginate through all liked songs
        while (true) {
            const data = await spotifyApi.getMySavedTracks({ limit, offset });

            // Push track details to the likedSongs array
            likedSongs = likedSongs.concat(
                data.body.items.map(item => ({
                    name: item.track.name,
                    artist: item.track.artists.map(artist => artist.name).join(', '),
                    album: item.track.album.name,
                    image: item.track.album.images[0]?.url,
                    addedAt: item.added_at, // Date when the song was liked
                    popularity: item.track.popularity // Popularity score of the song
                }))
            );

            if (data.body.items.length < limit) break; // Exit loop if fewer items are returned
            offset += limit; // Move to the next page
        }

        res.json({ likedSongs }); // Return JSON response
    } catch (error) {
        console.error('Error fetching liked songs:', error);
        res.status(500).json({ error: 'Failed to fetch liked songs' });
    }
});

module.exports = router;