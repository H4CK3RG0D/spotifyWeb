require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8181;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

app.locals.spotifyApi = spotifyApi;

app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'search.html'));
});

app.get('/login', (req, res) => {
    const scopes = [
        'user-read-private', 
        'user-read-email', 
        'user-read-playback-state', 
        'user-modify-playback-state', 
        'user-top-read', 
        'user-read-recently-played',
        'user-library-read',
        'playlist-modify-private',
        'playlist-modify-public'
        ];

    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);   
    // console.log(authorizeURL);
    res.redirect(authorizeURL);
 });

 app.get('/logout', (req, res) => {
    try {
        // Clear the access and refresh tokens
        spotifyApi.setAccessToken(null);
        spotifyApi.setRefreshToken(null);

        res.status(200).json({ message: 'Successfully logged out' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Failed to log out', details: error.message });
    }
});


 app.get('/callback', async (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;

    if (error) {
        console.error('Callback error:', error);
        res.send(`Callback error: ${error}`);
        return;
    }

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const accessToken = data.body['access_token'];
        const refreshToken = data.body['refresh_token'];
        const expiresIn = data.body['expires_in'];

        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        setInterval(async () => {
            const data = await spotifyApi.refreshAccessToken();
            const newAccessToken = data.body['access_token'];
            spotifyApi.setAccessToken(newAccessToken);
        }, (expiresIn / 2) * 1000);

        // Redirect to search.html
        res.redirect('/');
    } catch (error) {
        console.error('Error getting Tokens:', error);
        res.send(`Error getting Tokens: ${error}`);
    }
});


    app.get('/search-query', (req, res) => {
        const { q } = req.query;
        spotifyApi.searchTracks(q).then(searchedData => {
            const tracks = searchedData.body.tracks.items;
            res.json(tracks.length > 0 ? tracks[0] : { error: 'No tracks found' });
        }).catch(error => {
            console.error('Error searching:', error);
            res.json(`{ error: Error searching: ${error} }`);
        });
    });

    app.get('/random-song', (req, res) => {
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

    app.get('/play', (req, res) => {
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



    app.get('/get-user-stats', async (req, res) => {
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

    app.get('/liked-songs', async (req, res) => {
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

    app.get('/test', async (req, res) => {
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

app.get('/save-liked-songs', async (req, res) => {
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

    app.get('/crp', async (req, res) => {
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

    const MONTH_NAMES = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];
    
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    app.get('/cmp', async (req, res) => {
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

    
    
    app.listen(port, () => {
        console.log(`Server started on http://localhost:${port}/login`);
    });