import React from 'react'
import {FaArrowRight, FaPause, FaPlay, FaPlus, FaTrash} from 'react-icons/fa'
import {MdExplicit} from 'react-icons/md'
import {defaultTrackObj} from '../constants/constants'
import './track.scss'

function Track(props) {
    const handleNextRecommendation = () => {
        props.setCurrentRecIndex(prev => prev + 1);
        props.playTrack(props.recommendations[props.currentRecIndex]
            ?.uri);
    }

    const cleanTimer = (ms, type) => {
        if (type === "s") 
            ms *= 1000; // convert to seconds
        let seconds = ms / 1000;
        let m = Math.floor(seconds / 60);
        seconds = parseInt(seconds % 60);
        if (seconds < 10) 
            seconds = '0' + seconds;
        return `${m}:${seconds}`;
    };

    return (props.thisTrack.uri
        ? (
        <div key={props.thisTrack.id}
                className={`track ${props.current_track.uri == props.thisTrack.uri && 
                props.currentPosition > 0
                ? 'playing'
                : ''}`}>
                <figure onClick={() => {
                    props.thisTrack.uri && props.playTrack(props.thisTrack.uri)
                }}>
                    <img className='thumbnail'
                        src={props.thisTrack.album.images[0]
                        ?.url}
                        alt={props.thisTrack.album.name}
                        title={props.thisTrack.album.name}
                    />
                    <figcaption>
                        <h2>{props.thisTrack.name} {props.thisTrack.explicit && <MdExplicit style={{ fontSize: '18px' }}/>}</h2>
                        <p>{props
                                .thisTrack
                                .artists
                                .map((artist, i) => {
                                    return artist.name
                                })
                                .join(', ')}
                        </p>
                        {props.columnClass == 'now-playing' && <div className='progress-container'>
                            <progress
                                className='progress-bar'
                                min='1'
                                max='100'
                                value={props.current_track.uri == props.thisTrack.uri ? 
                                (props.currentPosition / props.current_track.duration_ms) * 100
                                : 0}
                            />
                            <span className='timer'>
                            {cleanTimer(props.currentPosition)} / {cleanTimer(props.current_track.duration_ms)}
                            </span>
                        </div>}
                    </figcaption>
                </figure>
                <section className='buttons'>
                    {props.columnClass == 'tracklist' && 
                    <button className='button'
                        title='Select Track'
                        onClick={() => {
                          props.setSeedTrack(props.thisTrack)
                        }}
                    >
                      <FaPlus/>
                    </button>}
                    {props.columnClass == 'modifiers' && 
                    <button className='button'
                        title='Clear Track'
                        onClick={() => {
                        props.setSeedTrack(defaultTrackObj)
                        }}
                    >
                      <FaTrash/>
                    </button>}
                    {props.columnClass == 'recommendation' && 
                    <button className='button'
                        title='Play'
                        onClick={() => {
                        props.playTrack(props.thisTrack.uri)
                      }}
                    >
                    {(props.current_track.uri == props.thisTrack.uri && props.is_paused) || 
                      props.current_track.uri != props.thisTrack.uri
                            ? <FaPlay/>
                            : <FaPause/>}
                    </button>}
                    {props.columnClass == 'now-playing' && 
                    <>
                      <button className ='button' title ='Play' onClick={() => {
                            props.playTrack(props.thisTrack.uri)
                        }}
                      > {
                        (props.current_track.uri == props.thisTrack.uri && props.is_paused) || 
                        props.current_track.uri != props.thisTrack.uri
                            ? <FaPlay/>
                            : <FaPause/>} 
                      </button>
                      <button className='button' title='Next Recommendation' onClick={() => { 
                      handleNextRecommendation()}}>
                        <FaArrowRight /> 
                      </button> 
                    </>}
                </section>
            </div>) 
          : <div className='track'></div>)
}

export default Track;