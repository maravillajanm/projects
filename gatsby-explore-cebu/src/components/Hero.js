import React from "react"
import styled from "styled-components"
import { Button } from "./button"
import Video from "../assets/videos/hero-video.mp4"

const Hero = () => {
    return (
        <HeroContainer>
            <HeroBg>
                <VideoBg src={Video} type='video/mp4' autoPlay loop muted playsInline/>
            </HeroBg>
            <HeroContent>
                <HeroItems>
                    <HeroH1>Explore Cebu!</HeroH1>
                    <HeroP>Let's discover the wonders of Cebu</HeroP>
                    <Button primary='true' big='true' round='true' to='/trips'>Travel Now</Button>
                </HeroItems>
            </HeroContent>
        </HeroContainer>
    )
}

export default Hero

const HeroContainer = styled.div`
background: #0c0c0c;
display: flex;
justify-content: center;
align-items: center;
height: 100vh;
padding: 0 1 rem;
position: relative;
color: #fff;
margin-top: -80px;

:before {
    content:"";
    position: absolute;
    top: 0;
bottom: 0;
left: 0;
right: 0;
z-index: 2;
background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%), linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 100%)
}
`

const HeroBg = styled.div`
position: absolute;
top: 0;
bottom: 0;
left: 0;
right: 0;
height: 100%;
width: 100%;
overflow: hidden;
`
const HeroContent = styled.div`
z-index: 3;
height: calc(100v - 80px);
max-height: 100%;
padding: 0rem calc((100vw - 1300px)/2);

`
const HeroItems = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
text-align: center;
height: 100vh;
padding: 0;
color: #fff;
line-height: 1.1;
font-weight: bold;
`
const VideoBg = styled.video`
height: 100%;
width: 100%;
object-fit: cover;
-o-object-fit: cover;
`

const HeroH1 = styled.h1`
font-size: clamp(1.5rem, 6vw, 4rem);
margin-bottom: 1.5rem;
letter-spacing: 3px;
padding: 0 1rem;
`

const HeroP = styled.p`
font-size: clamp(1rem, 3vw, 3rem);
margin-bottom: 2rem;
font-weight: 400;
`