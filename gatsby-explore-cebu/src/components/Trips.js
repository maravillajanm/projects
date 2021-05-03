import React from "react"
import styled from 'styled-components'


const Trips = () =>{


    return (
        <PlaceContainer>
            <PlaceHeading>Heading</PlaceHeading>
            <PlaceWrapper>Wrapper</PlaceWrapper>
        </PlaceContainer>
    )
}
export default Trips

const PlaceContainer = styled.div`
min-height: 100vh;
padding: 5rem calc((100vw - 1300px)/2);
background: white;
color: black;
`

const PlaceHeading = styled.div`
font-size: clamp(1.2rem, 5vw, 3rem);
text-align: center;
margin-bottom: 5rem;
color: #000;
`

const PlaceWrapper = styled.div``

