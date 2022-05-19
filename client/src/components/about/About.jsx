import React from 'react'
import './about.scss'
import guitar from '../../img/guitar.jpg';
import mc from '../../img/mc.jpg';
import { FaQuestion, FaHeadphones, FaSearch, FaInfoCircle } from 'react-icons/fa'

const About = () => {
  return (
    <div className='jmp__about_container'>
      
      <div className='jmp__about_header'>
          <h1><FaInfoCircle /> About</h1>
      </div>
      <div className='jmp__about_content'>
        <p>
          The JAMrog music player is a fun project I developed using Node, ReactJS, and the Spotify API. This app is designed to help you find music recommendations based on certain criteria (energy, tempo, danceability, etc.).
        </p>
        </div>
      <div className='jmp__about_buttons'>
        {/* <button><FaQuestion /> Find me something new!</button>
        <button><FaSearch /> Search for a song/artist</button> */}
        <button><a href='/player' style={{textDecoration: 'none', color: '#fff'}}><FaHeadphones /> Take me to the player!</a></button>
      </div>
     </div> 
  )
}

export default About