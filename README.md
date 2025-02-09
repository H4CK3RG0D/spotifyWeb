# spotifyWeb

A web-based application for interacting with Spotify's API.

# Installation and Setting up

## Node.js

Ensure you have [Node.js](https://nodejs.org/en) installed.

Clone the repository:

```cmd
git clone https://github.com/H4CK3RG0D/spotifyWeb.git
cd spotifyWeb
```

## Install dependencies:

```cmd
npm install
```

Start the development server:

```cmd
npm run start
```

## Adding Spotify Client API and ID

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Log in and create a new application.
3. Copy the Client ID and Client Secret from the application settings.

Create a .env file in the root of your project and add the following:

```
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
REDIRECT_URI=your-redirect-uri
```

Save the file and restart your server if necessary.

## Required Steps

1. Run the server: `npm run test`.
2. Run `http://localhost:{port}/save-liked-songs` to create the `liked-songs.json` into the main directory


# Endpoints

1. `/liked-songs`: Display users' all liked songs in a `.json` format
2. `/save-liked-songs`: Imports users all liked songs into a `.json` file with song properties
3. `/crp`: Creates a "rap" playlist based on the artist listed
4. `/cmp`: Creates a monthly playlist based popularity score of `55+`
5. `/play?uri={track-uri}`: Plays a song based on inputted song uri
6. `/random-song`: Plays a random song

# Configuration

##  `/cmp` Popularity Range

To change the popularity range, update the filtering condition in the code snippet below. Adjust the threshold to suit your needs:

```js
        const tracksByMonth = likedSongsArray
                .filter(song => song.popularity > 55) // POPULARITY SCORE OVER 55
```

## `/crp` Artist List

To change the artist list, simply add an artist's ID inside the array `artistIds`, which can be obtained by copying the artist's link through spotify url.

```js
const artistIds = [
                '3TVXtAsR1Inumwj472S9r4', // Drake
                '699OTQXzgjhIYAHMy9RyPD', // Playboi Carti
                '1Xyo4u8uXC1ZmMpatF05PJ', // The Weeknd
                ...
            ];
```

For example: **The Weeknd**: `https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ`, which



# Future Ideas!!!

- Add an algorithm to `/cmp` based on themes of a song
- Create an file for each endpoint + handler.
- New endpoints: `/recommendations`, `/trending`

---

Made with <3 by Bryan 