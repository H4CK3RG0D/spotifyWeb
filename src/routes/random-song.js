const express = require('express');
const spotifyApi = req.app.locals.spotifyApi;
const router = express.Router();

router.get('/random-song', (req, res) => {
    // Define a list of genres to search randomly
    const genres = ['pop', 'rock', 'hip-hop', 'electronic', 'classical', 'jazz', 'mandopop', 'rap', 'metal', 'blues'];
    
    // Select a random genre
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];

    // Search for tracks in the selected genre
    spotifyApi.searchTracks(`genre:"${randomGenre}"`)
        .then(data => {
            // Get a list of tracks from the search results
            const tracks = data.body.tracks.items;
            if (tracks.length > 0) {
                // Randomly select a track from the results
                const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];

                // Get the track URI to play it
                const trackUri = randomTrack.uri;

                // Play the selected track
                spotifyApi.play({ uris: [trackUri] })
                    .then(() => {
                        res.json({ message: 'Playing random track!', track: randomTrack.name, artist: randomTrack.artists[0].name });
                    })
                    .catch(error => {
                        console.error('Error playing track:', error);
                        res.json(`{ error: Error playing track: ${error.message} }`);
                    });
            } else {
                res.json({ error: 'No tracks found in this genre.' });
            }
        })
        .catch(error => {
            console.error('Error searching for tracks:', error);
            res.json(`{ error: Error searching for tracks: ${error.message} }`);
        });
});

module.export = router;