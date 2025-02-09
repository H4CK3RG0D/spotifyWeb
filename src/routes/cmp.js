const express = require('express');
const router = express.Router();

const MONTH_NAMES = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

router.get('/cmp', async (req, res) => {
    const spotifyApi = req.spotifyApi;
    
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
