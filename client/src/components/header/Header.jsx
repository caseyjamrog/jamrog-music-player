import {React, useState, useEffect} from 'react'
import './header.scss'
import { getCookie } from '../constants/constants'
import {
    FaHome,
    FaHeadphones,
    FaSearch,
    FaInfoCircle,
    FaSortDown,
    FaSortUp
} from 'react-icons/fa'

const Header = () => {
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    useEffect(() => {
        // check for logged in user data
        setUserLoggedIn(getCookie("jmp-spotify-user").length > 0);
    }, [])


    const profileIconStyle = {
        fontSize: '28px',
        cursor: 'pointer'
    };

    const loginSpotify = () => {
        window.location.href = "http://localhost:8888/auth/login"
    }
    const logoutSpotify = () => {
        window.location.href = "http://localhost:8888/auth/logout"
    }

    const toggleProfileMenu = () => {
        let menu = document.getElementsByClassName('jmp__header_profile_menu')[0];
        profileMenuOpen
            ? menu
                .classList
                .remove('menu-is-open')
            : menu
                .classList
                .add('menu-is-open');

        setProfileMenuOpen(!profileMenuOpen);
    }

    const generateUserInfo = () => {
        let user = JSON.parse(decodeURIComponent(getCookie("jmp-spotify-user")));

        console.log('getting user data from cookies:', (user));
        if (!user) 
            return (
            <>
              <p>Sign Up</p>
              <button type="button" onClick={loginSpotify}>Sign In</button> 
            </>);
        
        return (
            <div className='jmp__header_profile_container'>
                <p>Hi {user.display_name}!</p>
                <div className='jmp__header_profile_image' onClick={toggleProfileMenu}>
                    <img src={user.images[0].url} alt="profile"/> {profileMenuOpen
                        ? <FaSortUp style={profileIconStyle}/>
                        : <FaSortDown style={profileIconStyle}/>}
                </div>
                <div className='jmp__header_profile_menu'>
                    <span>My Profile</span>
                    <span>Player Settings</span>
                    <span onClick={logoutSpotify}>Log Out</span>
                </div>
            </div>
        );
    }

    

    return (
        <div className='jmp__header'>
            <div className='jmp__header_name_logo_container'>
                <h1><FaHeadphones/> JAMrog Music Player</h1>
                <p>Discover your new favorite songs!</p>
            </div>

            <div className='jmp__header_navigation_container'>
                <p>
                  <a href="/"><FaHome/>Home</a>
                </p>
                <p>
                  <a href="/about"><FaInfoCircle/>About</a>
                </p>
                <p>
                  <a href="/player"><FaHeadphones/>Listen</a>
                </p>
                {/* <p>
                  <a href="/search"><FaSearch/>Search</a>
                </p> */}
            </div>
            <div className='jmp__header_sign'>
                {userLoggedIn
                    ? generateUserInfo()
                    : <div className='jmp__header_login_container'>
                        <p>
                            <a href='https://spotify.com/signup' target="_blank" rel='noreferrer'>Sign Up</a>
                        </p>
                        <button type="button" onClick={loginSpotify}>Sign In</button>
                    </div>}

            </div>
        </div>
    )
}

export default Header