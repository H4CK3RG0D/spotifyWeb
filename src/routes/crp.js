const express = require('express');
const router = express.Router();

router.get('/crp', async (req, res) => {
    const spotifyApi = req.spotifyApi;
        try {
            const artistIds = [
                '3TVXtAsR1Inumwj472S9r4', // Drake
                '6l3HvQ5sa6mXTsMTB19rO5', // J. Cole
                '2YZyLoL8N0Wb9xBt1NhZWg', // Kendrick Lamar
                '5K4W6rqBFWDnAN6FQUkS6x', // Kanye West
                '0Y5tJX1MQlPlqiwlOH1tJY', // Travis Scott
                '7dGJo4pcD2V6oG8kP0tJRR', // Eminem
                '699OTQXzgjhIYAHMy9RyPD', // Playboi Carti
                '1Xyo4u8uXC1ZmMpatF05PJ', // The Weeknd
                '1RyvyyTE3xzB2ZywiAwp0i', // Future
                '0iEtIxbK0KxaSlF7G42ZOp', // Metro Boomin
                '4MCBfE4596Uoi2O4DtmEMz', // Juice WRLD
                '07YZf4WDAMNwqr4jfgOZ8y', // Don Toliver
                '6DPYiyq5kWVQS4RGwxzPC7', // Dr. Dre
                '7hJcb9fa4alzcOq3EaNPoG', // Snoop Dogg
                '3qiHUAX7zY4Qnjx8TNUzVx', // Yeat
            ];
    
            let topSongs = [];
    
            for (const artistId of artistIds) {
                const data = await spotifyApi.getArtistTopTracks(artistId, 'US'); 
                topSongs = topSongs.concat(data.body.tracks.map(track => track.uri));
            }
    
            if (topSongs.length === 0) {
                return res.status(400).json({ error: 'No top songs found for the specified artists.' });
            }
    
            topSongs = [...new Set(topSongs)].sort(() => Math.random() - 0.5);
    
            // Create a playlist for top songs from favorite artists
            const playlist = await spotifyApi.createPlaylist('Westside Cyphers', {
                description: "She wanna taste it, checkin' the swag today, ho, come back tomorrow",
                public: false,
            });
    
            console.log(`Playlist "${playlist.body.name}" created successfully.`);
    
            // Add Tracks to Playlist in Chunks
            const chunkSize = 100;
            for (let i = 0; i < topSongs.length; i += chunkSize) {
                const chunk = topSongs.slice(i, i + chunkSize);
                await spotifyApi.addTracksToPlaylist(playlist.body.id, chunk);
            }
    
            res.json({
                message: 'Playlist created successfully',
                playlist: {
                    name: playlist.body.name,
                    url: playlist.body.external_urls.spotify,
                },
            });
        } catch (error) {
            console.error('Error creating top songs playlist:', error.message);
            res.status(500).json({ error: 'Failed to create playlist' });
        }
});

module.exports = router;