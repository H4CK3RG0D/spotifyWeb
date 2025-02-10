# Spotify Web API – Developer Overview 

The Spotify Web API allows developers to integrate Spotify’s powerful music data and playback capabilities into their applications. It provides access to Spotify’s catalog, user playlists, recommendations, track metadata, and player controls via RESTful endpoints.

--- 
# Key Features
- Retrieve Music Data – Get details about songs, albums, artists, and genres.
- User Authentication – Authenticate users via OAuth 2.0 to access personal Spotify data.
- Control Playback – Play, pause, skip, and modify playback on a user’s active device.
- Manage Playlists – Create, edit, and delete playlists programmatically.
- Track User Data – Access recently played tracks, top artists, and top tracks.

---

# Installation and Set Up

The following steps are intended for local hosting. If you plan to deploy the application on a server or cloud service, follow the [Glitch Setup](#glitch-setup).

## Node.js

Ensure you have [Node.js](https://nodejs.org/en) installed.

Download or Clone the repository:

```sh
git clone https://github.com/H4CK3RG0D/spotifyWeb.git
cd spotifyWeb
```

## Install dependencies:

Installs all packages:
```sh
npm install
```

Start the development server:

```sh
npm run start
```

## Adding Spotify Client Secret, Client ID and Redirect URI

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Log in and create a new application.
3. Make sure you check `Web API` under APIs used
4. Copy the Client ID and Client Secret from the application settings.
5. Under **Redirect URIs**, add the following URI: `http://localhost:8181/api/callback`

6. For local hosting, create a `.env` file in the root of your project and add the following:

```sh
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
REDIRECT_URI=http://localhost:8181/api/callback
```
6.5. For Glitch, click on the `.env` and add each as a variable

Save the file and restart your server if necessary.

---

# Glitch Setup

This section explains how to set up using Glitch.com

## Creating Project
1. Go to [Glitch](https://glitch.com). Login.
2. Click **New Project** and select **Import from GitHub**
3. Paste the repository URL `H4CK3RG0D/spotifyWeb` and import the project.

Once the project is imported, run to install all dependencies:
```sh
npm install
```
## Checking the correcg NodeJS version for Glitch
To ensure this code works, Node.js v18 must be running. To check the glich's NodeJS version, run in the terminal:
```sh
node -v
```

If the node version is `v18.0.0+`, you will be set to run.


## Configuring Environment Variables

1. Click on `.env` in your Glitch project.
2. Add the following environment variables:

```sh
CLIENT_ID=your_spotify_client_id
CLIENT_SECRET=your_spotify_client_secret
REDIRECT_URI=https://your-glitch-project.glitch.me/api/callback
PROJECT_DOMAIN=your-glitch-project
```
## Updating Redirect URI in Spotify Developer Dashboard

1. Go to Spotify Developer Dashboard.
2. Select your app.
3. Find Redirect URIs and add: `https://your-glitch-project.glitch.me/api/callback`
4. Save the changes.

### Testing the Application

1. Open `https://your-glitch-project.glitch.me/api/login` in your browser.
2. Login with your Spotify account.
3. After authentication, you should be redirected to search.html.
---


# Create `liked-songs.json` file 
1. Run `http://localhost:8181/api/save-liked-songs` (LOCAL) or `https://your-glitch-project.glitch.me/api/save-liked-songs` (GLITCH) to create the `liked-songs.json` into the main directory.

# Configuration

##  `/cmp` Popularity Range

To change the popularity range, update the filtering condition in the code snippet below. Adjust the threshold to suit your needs:

```js
        const tracksByMonth = likedSongsArray
                .filter(song => song.popularity > 55) // POPULARITY SCORE OVER 55
                ...
```

## `/crp` Artist List

To change the artist list, simply add an artist's ID inside the `artistIds` array, which can be obtained by copying the artist's link through spotify url.

```js
const artistIds = [
                '3TVXtAsR1Inumwj472S9r4', // Drake
                '699OTQXzgjhIYAHMy9RyPD', // Playboi Carti
                '1Xyo4u8uXC1ZmMpatF05PJ', // The Weeknd
                ...
            ];
```

For example: **The Weeknd**: [`https://open.spotify.com/artist/`**`1Xyo4u8uXC1ZmMpatF05PJ`**](https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ)

## `/random-songs` Genre

You can customize the genre selection for randomly played songs by modifying the `genres` array. Simply update or extend the list to include your preferred genres. A full list of supported 1383 genres can be found [here](https://gist.githubusercontent.com/andytlr/4104c667a62d8145aa3a/raw/2d044152bcacf98d401b71df2cb67fade8e490c9/spotify-genres.md).

```js
const genres = ['pop', 'rock', 'hip-hop', 'electronic', ...];
```

---

# Endpoints

1. `/liked-songs`: Display users' all liked songs in a `.json` format
2. `/save-liked-songs`: Imports users all liked songs into a `.json` file with song properties
3. `/crp`: Creates a "rap" playlist based on the artist listed
4. `/cmp`: Creates a monthly playlist based popularity score of `55+`
5. `/play?uri={track-uri}`: Plays a song based on inputted song uri
6. `/random-song`: Plays a random song

# Future Ideas!!!

- Add an algorithm to `/cmp` based on themes of a song
- New endpoints: `/recommendations`, `/trending`
- Custom Spotify Home UI with Albums (Powered by Spicicy)

---

Made with ❤️ by Bryan