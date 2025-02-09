const express = require('express');
const spotifyApi = req.app.locals.spotifyApi;
const router = express.Router();

const MONTH_NAMES = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

router.get('/cmp', async (req, res) => {
    try {
        const likedSongsData = JSON.parse(fs.readFileSync('liked-songs.json', 'utf8'));
        const likedSongsArray = likedSongsData.likedSongs;

        const tracksByMonth = likedSongsArray
            .filter(song => song.popularity > 55)
            .reduce((acc, song) => {
                const month = new Date(song.addedAt).getMonth();
                acc[month] = acc[month] || [];
                acc[month].push(song.uri);
                return acc;
            }, {});

        const playlistLinks = {};

        for (const month of Object.keys(tracksByMonth)) {
            const monthName = MONTH_NAMES[month];
            const playlist = await spotifyApi.createPlaylist(monthName, {
                description: `${monthName} made with ❤️ by Spotify API`,
                public: false
            });

            await spotifyApi.addTracksToPlaylist(playlist.body.id, tracksByMonth[month]);
            playlistLinks[monthName] = playlist.body.external_urls.spotify;

            await delay(500); // Throttle requests
        }

        res.json({ message: "Playlists created successfully!", playlists: playlistLinks });
    } catch (error) {
        console.error('Error creating playlists:', error);
        res.status(500).json({ error: 'Failed to create playlists.', details: error.message });
    }
});

module.exports = router;