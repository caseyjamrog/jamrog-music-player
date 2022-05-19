import React from 'react'
import { FaPause, FaPlay, FaPlus, FaTrash } from 'react-icons/fa'
import './columnContent.scss'
import Track from '../track/Track'
import { defaultModifierObj, defaultTrackObj, iconStyles} from '../constants/constants'
import Modifier from '../modifier/Modifier'

export default function ColumnContent(props) {

  const showTrackList = () => {
    return props.topTracks.map((track, i) => {
      // console.log('rendering track', track)
      return ( 
          <Track key={track.id} {...props} thisTrack={track} />
      )
  })
  }


  const showModifierContent = () => {
    return (
    <>    
      {props.seedTrack.name.length ?
        <Track {...props} thisTrack={props.seedTrack}/>
      : 
        (<div className='track empty'>
          <p></p>
        </div>)}      
      {Object.entries(props.modifiers).map(([key, val], i) => {
        return <Modifier 
                key={key}
                refKey={key} 
                setModifiers={props.setModifiers} 
                modifiers={props.modifiers}
              />
      })}
      <section className='buttons'>
        <button className='recommendation-button' onClick={() => { props.getRecommendation()}} disabled={!props.seedTrack.name.length}>Generate!</button>
      </section>
    </>)
  }

  const showRecommendation = () => {
    return (
      <>
      { !props.recommendations.length ?
        (<div className='track empty'>
        <p></p>
      </div>)
      :
        (<>

<section className='buttons'>
        <button className='recommendation-button' onClick={() => { props.clearRecommendations([])}}>Clear</button>
        </section>
          {props.recommendations.map((recommendation, i) => {
            return <Track key={i} {...props} thisTrack={recommendation} />;
          })}
        </>
        )
      }
      </>
    )
  }

  const showNowPlaying = () => {
    return (!props.current_track.name.length ?
      <div className='track empty'></div>
      :
    <>

    <section className='buttons'>
        <button className='recommendation-button' onClick={() => { props.saveTrack(props.current_track.id)}}>Save Track</button>
        <button className='recommendation-button' onClick={() => { props.playTrack(props.current_track.uri)}}>Replay</button>
    </section>
    <Track {...props} thisTrack={props.current_track} />
    </>
    )
  }

  return (
    <section className={'content ' + props.columnClass}>
        <header>
            <h2>{props.columnHeader}</h2>
        </header>        
        { props.columnClass == 'tracklist' && showTrackList()}
        { props.columnClass == 'modifiers' && showModifierContent()}
        { props.columnClass == 'recommendation' && showRecommendation()}
        { props.columnClass == 'now-playing' && showNowPlaying()}
    </section>
  )
}
