const express = require('express');
const path = require('path'); 
const router = express.Router();

router.get('/play', async (req, res) => {
    try {
        const spotifyApi = req.spotifyApi; 
        if (!spotifyApi) {
            return res.status(500).json({ error: 'Spotify API is not initialized' });
        }

        const { uri } = req.query;
        if (!uri) {
            return res.status(400).json({ error: 'No URI provided' });
        }
        const devicesResponse = await spotifyApi.getMyDevices();
        const activeDevice = devicesResponse.body.devices.find(device => device.is_active);

        if (!activeDevice) {
            return res.status(400).json({ error: 'No active Spotify device found. Please open Spotify and try again.' });
        }
        await spotifyApi.play({ uris: [uri], device_id: activeDevice.id });

        res.sendFile(path.join(process.cwd(), 'views', 'index.html')); 
    } catch (error) {
        console.error('❌ Error playing track:', error);
        res.status(500).json({ error: 'Failed to play track.', details: error.message });
    }
});

module.exports = router;
