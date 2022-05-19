import React from 'react'
import { FaCopyright, FaSpotify } from 'react-icons/fa'
import './footer.scss'

const iconStyles = {
  fontWeight: 500,
  color: "#fff"
}

const Footer = () => {
  return (
    <div className='jmp__footer_container'>
      <p className='jmp__footer_author'>Casey Jamrog <FaCopyright style={iconStyles}/> 2022</p>
      <p className='jmp__footer_powered'>Powered by <FaSpotify style={iconStyles}/> Spotify</p>
    </div>
  )
}

export default Footer