import React, {useState, useEffect} from 'react'
import './player.scss'
import axios from 'axios'
import ColumnContent from '../../components/columnContent/ColumnContent'
import {defaultModifierObj, defaultTrackObj, getCookie} from '../constants/constants'

const Player = () => {
    /* Establish state variables for player */
    const [player, setPlayer] = useState(undefined);
    const [deviceId, setDeviceId] = useState(null);
    const [topTracks, setTopTracks] = useState([]);
    const [seedTrack, setSeedTrack] = useState(defaultTrackObj);
    const [is_paused, setPaused] = useState(true);
    const [current_track, setTrack] = useState(defaultTrackObj);
    const [progressTimer, setProgressTimer] = useState(0);
    const [modifiers, setModifiers] = useState(defaultModifierObj);
    const [recommendations, setRecommendations] = useState([])
    const [currentRecIndex, setCurrentRecIndex] = useState(0);

    // On initial render, grab our top tracks and initialize the player
    useEffect(() => {
        getMyTopSongs()
        initializePlayer();
    }, []);

    // seed track was selected
    useEffect(() => {
        getTrackAudioFeatures(seedTrack.id);
    }, [seedTrack]);

    // Set song progress bar intervals for updating every second
    useEffect(() => {
        let interval = null;
        if (!is_paused) {
            console.log("Music is Playing!");
            interval = setInterval(() => {
                setProgressTimer(progressTimer => progressTimer + 1000);
            }, 1000);
        } else 
            clearInterval(interval);
        
        return () => clearInterval(interval);
    }, [is_paused]);

    /* Function initializes the spotify player on the web page, generating a device id and setting a couple event listeners. */
    const initializePlayer = () => {
        // Grab the token from cookies. If missing, set to null and handle error below
        let token = getCookie("jmp_access") || null;
        let scriptUrl = "https://sdk.scdn.co/spotify-player.js";

        // if the script already exists on the page, its already initialized so were
        // done
        if (document.querySelectorAll(`script[src="${scriptUrl}"]`).length > 0) {
            console.log('Spotify player already initialized...');
            return;
        }

        // if we dont have a token, we cant initialize so tell user and quit
        if (!token) {
            alert('Spotify player wasnt initialized because there is no token. Try signing back in.' +
                    '..');
            return;
        }

        // create the script tag for the index file
        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;

        document
            .body
            .appendChild(script);

        // Set up onReady event listener for spotify SDK
        window.onSpotifyWebPlaybackSDKReady = () => {
            // init player object with token. Set volume to 50%
            const player = new window
                .Spotify
                .Player({
                    name: 'Jamrog Music Player',
                    getOAuthToken: callback => {
                        callback(token);
                    },
                    volume: 0.5
                });

            // save player in state
            setPlayer(player);

            // player is ready, save the device id in state for API calls
            player.addListener('ready', ({device_id}) => {
                console.log('Ready with Device ID', device_id);
                setDeviceId(device_id);
            });

            // Device crashed?
            player.addListener('not_ready', ({device_id}) => {
                console.log('Device ID has gone offline', device_id);
            });

            // on change event for player i.e. player started/stopped playing, player loaded
            // new stream data
            player.addListener('player_state_changed', state => {
                // no state we cant set anything, exit
                if (!state) {
                    return;
                }

                // Set states with current track details
                setTrack(state.track_window.current_track);
                setPaused(state.paused);
                setProgressTimer(state.position);
            });

            // connect player object to component
            player.connect();

        };
    }

    /* Function gets top tracks list from session if already have them, else asks server to get them from spotify. Sets state variables for player use. */
    const getMyTopSongs = () => {
        let sessionTopTracks = sessionStorage.getItem('jmp_top_tracks');

        // We got the tracks from session, set them immediately
        if (sessionTopTracks) {
            setTopTracks(JSON.parse(sessionTopTracks));
        } else {
            // send to server
            axios
                .get("/player/getTopSongs")
                .then((resp) => {
                    let tracks = resp.data;
                    sessionStorage.setItem('jmp_top_tracks', JSON.stringify(tracks));
                    console.log("session storage:", sessionStorage);
                    setTopTracks(tracks);
                })
                .catch((err) => console.log(err));
        }
    }

    /* Function that plays the given uri on our webpage */
    const playTrack = (uri) => {
        console.log('Playing track', uri);

        // If the uri is currently playing, toggle play/pause
        if (current_track.uri == uri) {
            player.togglePlay();
            return;
        }

        // grab token from cookie
        let token = getCookie("jmp_access") || null;

        if(!token){
            alert('no token found... sign in again to restart app.');
        }

        if(!deviceId){
            alert('Device ID not found. Refresh the page to play.');
        }
        
        // API call to spotify to play track
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            body: JSON.stringify({uris: [uri]}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).catch((err) => {
            if (err.status == 401) {
                console.log('token expired. reauthenticating...');
                // TODO: Add reauthentication
            }
            alert("Something went wrong trying to play track...");
        });
    };

    /* Function saves the currently playing track to the users saved tracks list */
    const saveTrack = (trackId) => {
        // token
        let token = getCookie("jmp_access") || null;

        if (!token) {
            alert("Couldnt save track... Missing token.");
            return;
        }

        // API call to save track
        axios({
            url: `https://api.spotify.com/v1/me/tracks?ids=${trackId}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(resp => {
            // success, tell the user
            if (resp.status == 200) {
                alert(`${current_track.name} by ${current_track.artists[0].name} has been added to your saved songs.`);
            }

        }).catch(err => {
            // we failed, report error
            alert(`Error saving track: ${err.status} - ${err.message}`);
        })

    }

    /* Function gets the given tracks audio features for a starting point to modify your recommendations. */
    const getTrackAudioFeatures = (id) => {
        // grab token
        let token = getCookie("jmp_access") || null;

        // error handling
        if (!id) {
            console.log(' no seed id found...');
            return;
        }

        if (!token) {
            console.log('No token found...');
            return;
        }

        // API call
        axios.get(`https://api.spotify.com/v1/audio-features?ids=${id}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            },
            json: true
        }).then((resp) => {
            // success, grab feature object and the current state
            let features = resp.data.audio_features[0];
            let clone = JSON.parse(JSON.stringify(modifiers));

            // for each modifier, activate the modifier and set the value to the new one we
            // just got
            Object
                .entries(clone)
                .forEach(([
                    key, val
                ], i) => {
                    clone[key].disabled = false;
                    clone[key].value = features[key]
                });

            // set modifiers state
            setModifiers(clone);
        }).catch((err) => {
            console.log('error occurred getting audio features:', err.toJSON());
        })
    }

    /* Function generates 3 tracks based on the seed track and active modifiers */
    const getRecommendation = () => {
        let token = getCookie("jmp_access") || null;

        // generate url parameters for each modifier
        let modifierStrings = Object
            .entries(modifiers)
            .map(([
                name, val
            ], i) => {
                return !val.disabled
                    ? `&target_${name}=${val.value}`
                    : ''
            })
            .join('');

        axios.get(`https://api.spotify.com/v1/recommendations?seed_tracks=${seedTrack.id}${modifierStrings}&limit=3`, {
            headers: {
                'Authorization': 'Bearer ' + token
            },
            json: true
        }).then((resp) => {
            // we found some recommendations
            let track = resp.data.tracks[0];

            // set the state and play the first track
            setRecommendations(resp.data.tracks);
            playTrack(track.uri);
        }).catch((err) => {
            console.log('An error occurred generating recommendations:', err);
        })

    }

    return (
        <section className='container'>
            <div className={`column ${seedTrack.name.length == 0
                ? 'active'
                : 'complete'}`}>
                <div className='column-header'>
                    <h1>1. Select a Starting Track</h1>
                    <p className='column-helper-text hide'>Here is some of your top tracks from the
                        past 6 months according to Spotify. Select one as your starting place for
                        recommendations!
                    </p>
                </div>
                <ColumnContent
                    columnClass='tracklist'
                    columnHeader=''
                    topTracks={topTracks}
                    setSeedTrack={setSeedTrack}
                    playTrack={playTrack}
                    current_track={current_track}
                    currentPosition={progressTimer}
                    is_paused={is_paused}/>
            </div>
            <div className={`column ${seedTrack.name.length == 0
                ? ''
                : recommendations.length == 0
                    ? 'active'
                    : 'complete'}`}>
                <div className='column-header'>
                    <h1>
                        2. Set Your Modifiers</h1>
                    <p className='column-helper-text hide'>
                        Once you have a starting track, you can modify the attributes of the track to
                        target a more specific recommendation(Or just use the starting tracks
                        attributes!).
                    </p>
                </div>
                <ColumnContent
                    columnClass='modifiers'
                    columnHeader=''
                    seedTrack={seedTrack}
                    setModifiers={setModifiers}
                    modifiers={modifiers}
                    getRecommendation={getRecommendation}
                    is_paused={is_paused}
                    current_track={current_track}
                    currentPosition={progressTimer}
                    setSeedTrack={setSeedTrack}
                    playTrack={playTrack}/>
            </div>
            <div className={`column split ${current_track.name.length && 'active'}`}>
                <div className='top-container'>
                    <div className='column-header'>
                        <h1>
                            3. Listen!</h1>
                        <p className='column-helper-text hide'>
                            Enjoy your recommended song by clicking the play button next to each track.If
                            you like the song, you can add it to one of your playlists!
                        </p>
                    </div>
                    <ColumnContent
                        columnClass='recommendation'
                        columnHeader=''
                        seedTrack={seedTrack}
                        setModifiers={setModifiers}
                        modifiers={modifiers}
                        getRecommendation={getRecommendation}
                        is_paused={is_paused}
                        current_track={current_track}
                        currentPosition={progressTimer}
                        setSeedTrack={setSeedTrack}
                        playTrack={playTrack}
                        recommendations={recommendations}
                        clearRecommendations={setRecommendations}/>
                </div>
                <div className='bottom-container top-margin'>
                    <div className='column-header'>
                        <h1>
                            Now Playing</h1>
                        <p className='column-helper-text hide'></p>
                    </div>
                    <ColumnContent
                        columnClass='now-playing'
                        columnHeader=''
                        seedTrack={seedTrack}
                        setModifiers={setModifiers}
                        modifiers={modifiers}
                        getRecommendation={getRecommendation}
                        is_paused={is_paused}
                        current_track={current_track}
                        currentPosition={progressTimer}
                        setSeedTrack={setSeedTrack}
                        playTrack={playTrack}
                        recommendations={recommendations}
                        clearRecommendations={setRecommendations}
                        currentRecIndex={currentRecIndex}
                        setCurrentRecIndex={setCurrentRecIndex}
                        saveTrack={saveTrack}/>
                </div>
            </div>
        </section>
    )
}

export default Player