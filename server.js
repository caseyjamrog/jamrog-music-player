import express from 'express';
import axios from 'axios';
import qs from 'qs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import generateRandomString from './server/utils.js';
import { fileURLToPath } from 'url';
import 'dotenv/config';

/* constants */
const port = process.env.PORT || 8888;
const client_id = process.env.SPOTIFY_API_ID; // grab api id and secret from .env file
const client_secret = process.env.SPOTIFY_API_SECRET; 
const clientIdSecret = Buffer.from(client_id + ':' + client_secret, "utf8").toString('base64'); // stored base64 id and secret so we dont need to build it every token
const redirect_uri = 'http://localhost:8888/auth/callback';
const stateKey = 'spotify_auth_state';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* refresh token global */
var refreshToken = null;

/* Server startup */
const app = express();

app.use(express.static('./client/public'))
  .use(cors())
  .use(cookieParser());

app.listen(port, () => {
  console.log(`Listening on port ${port}...`)
});

// app.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
// });

/* Trigger spotify login request */
app.get('/auth/login', (req, res) => {

  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // authorization scopes
  let scopes = ['user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played',
    'user-modify-playback-state',
    'user-library-modify',
    'streaming'
  ];

  // pass in data via url parameters
  res.redirect('https://accounts.spotify.com/authorize?' + new URLSearchParams({
    response_type: 'code',
    client_id: client_id,
    scope: scopes.join(' '),
    redirect_uri: redirect_uri,
    state: state
  }).toString());
});

/*  Received callback from Spotify, trigger token request */
app.get('/auth/callback', (req, res) => {
  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) { // state is not the same as in cookie or lost cookie, return error
    res.redirect('/auth/error');
  } else {
    // done with state cookie, clear it
    res.clearCookie(stateKey);

    // request token
    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Authorization': 'Basic ' + clientIdSecret,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify({
          'code': code,
          'redirect_uri': redirect_uri,
          'grant_type': 'authorization_code'
        })
      })
      .then((resp) => {

        // success, we got a token
        let access_token = resp.data.access_token,
          expiration = resp.data.expires_in;

        // store refresh token on server
        refreshToken = resp.data.refresh_token;

        // set tokens as cookies, include expiration for access token
        res.cookie('jmp_access', access_token, {
          expire: Date.now() + (expiration * 1000)
        });

        // get profile info
        axios.get('https://api.spotify.com/v1/me', {
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            json: true
          })
          .then((resp) => {

            console.log(`Found user ${resp.data.display_name}`);

            // save profile data in a cookie like the tokens
            res.cookie('jmp-spotify-user', JSON.stringify(resp.data));

            // send back to home
            res.redirect('http://localhost:3000');
          })
          .catch((err) => {

            console.log('error in getting profile:', err.message);

            // error, clear cookie if exists
            res.clearCookie('jmp-spotify-user');
          });
      })
      .catch((err) => {
        console.log('Error in retrieving token: ', err);
        res.clearCookie('jmp_access');
      });
  }
});

/* callback function to refresh the access token when it expires */
const refreshTokenHandler = (req, res) => {

  // requesting new access token from refresh token  
  axios.post({
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + clientIdSecret
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    },
    json: true
  })
  .then((resp) => {
    // Success code, set new access token in cookie
    if (resp.statusCode === 200) {

      let access_token = resp.data.access_token,
        expiration = resp.data.expires_in;

      refreshToken = resp.data.refresh_token; // RESTORE refresh token in case it changed

      // Set cookie to new token
      res.cookie('jmp_access', access_token, {
        expire: Date.now() + (expiration * 1000)
      });
      res.redirect('back'); // send back to referrer 
      return;
    }
  })
  .catch((err) => {
    console.log('Couldnt refresh new access token: ' + err);
    res.clearCookie('jmp_access');
  });
}
/* route handler for refresh */
app.get('/auth/refresh_token', refreshTokenHandler);

/* user requested server log out, clear cookies and return to home */
app.get('/auth/logout', (req, res) => {

  // remove all cookies, send back to home
  console.log('user logged out...')

  res.clearCookie('jmp-spotify-user');
  res.clearCookie('jmp_access');
  res.clearCookie('jmp_refresh');

  res.redirect('http://localhost:3000');
});

/* route to get the users top tracks */
app.get('/player/getTopSongs', (req, res) => {

  let token = req.cookies["jmp_access"] || null;
  let topTracks = req.cookies["jmp_top_tracks"] || null;
  let authHeader = {
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };

  //  no token, send to refresh as a courtesy
  if (!token) {
    console.log('No token found in cookies... calling refresh handler.');
    refreshTokenHandler(req, res);
    return;
  } else if (topTracks) {
    // if we already have tracks from cookies, just grab the track data
    console.log("Got cookies... dont need to query")

    getMultipleTracks({
      res,
      tracks: topTracks,
      authHeader
    });
  } else {
    // find the top tracks
    axios.get('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=medium_term', authHeader)
      .then((resp) => {
        // convert tracks to string of ids
        let tracks = resp.data.items.map((v, i) => {
          return v.id;
        }).join(",");

        console.log('got tracks: ', tracks);

        // set in cookie for fast query later
        res.cookie('jmp_top_tracks', tracks);

        // get the track data
        getMultipleTracks({
          res,
          tracks,
          authHeader
        });
      })
  }
});

/* Function gets the track data for the list of track ids*/
const getMultipleTracks = ({
  res,
  tracks,
  authHeader
}) => {

  axios.get(`https://api.spotify.com/v1/tracks?ids=${tracks}`, authHeader)
    .then(resp => {
      // console.log('setting toptracks', resp.data.tracks)
      res.send(resp.data.tracks);
    })
    .catch(err => {
      console.log('something went wrong:', err.data);
    })
}