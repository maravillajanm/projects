import React from 'react'
import { Button } from './Button'
import { Link } from 'react-router-dom'
import './Styles/Navbar.css'

function Hero({lightBg, topLine, lightText, lightTextDesc, headline,    }) {
    return (
        <div className={lightBg ? 'home__hero-section' : 'home__hero-section darkBg'}>
            <h1>SASS Company</h1>
        </div>
    )
}

export default Hero
