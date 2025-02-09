const express = require('express');
const spotifyApi = req.app.locals.spotifyApi;
const router = express.Router();

router.get('/get-user-stats', async (req, res) => {
    try {
        // Initialize variables
        let totalListeningTimeMs = 0;
        let offset = 0;
        let limit = 50; // Maximum tracks per Spotify API call

        // Fetch user's top artists
        const topArtistsData = await spotifyApi.getMyTopArtists({ limit: 5 });
        const topArtists = topArtistsData.body.items.map(artist => ({
            name: artist.name,
            image: artist.images[0]?.url,
            genres: artist.genres.join(', '),
        }));

        // Fetch user's top tracks
        const topTracksData = await spotifyApi.getMyTopTracks({ limit: 5 });
        const topTracks = topTracksData.body.items.map(track => ({
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            image: track.album.images[0]?.url,
        }));

        // Fetch recently played tracks
        const recentlyPlayedData = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 5 });
        const recentTracks = recentlyPlayedData.body.items.map(item => ({
            name: item.track.name,
            artist: item.track.artists[0].name,
            album: item.track.album.name,
            image: item.track.album.images[0]?.url,
            duration_ms: item.track.duration_ms,
        }));

        // Calculate listening time for recently played tracks
        totalListeningTimeMs += recentTracks.reduce((total, track) => total + track.duration_ms, 0);

        // Aggregate total listening time from top tracks
        while (true) {
            const topTracksData = await spotifyApi.getMyTopTracks({
                limit,
                offset,
                time_range: 'long_term' // Fetch top tracks over long-term history
            });

            const tracks = topTracksData.body.items;
            if (tracks.length === 0) break;

            totalListeningTimeMs += tracks.reduce((total, track) => total + track.duration_ms, 0);

            if (tracks.length < limit) break; // Stop if fewer tracks than the limit
            offset += limit;
        }

        // Convert ms to minutes
        const totalListeningMinutes = Math.round((totalListeningTimeMs / 60000) * 100) / 100;

        // Return combined user stats
        res.json({
            topArtists,
            topTracks,
            recentTracks,
            totalListeningTime: totalListeningMinutes // Total listening minutes across all data
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.json({ error: 'Error fetching user stats. Please try again later.' });
    }
});

module.export = router;