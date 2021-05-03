import * as React from "react"
import { Link } from "gatsby"
import styled from "styled-components"
import { FaBars } from "react-icons/fa"
import { menuData } from "../data/menuData"

const Header = () => {
    return (
    <Nav>
      <NavLink to="/">Explore Cebu</NavLink>
      <Bars />
      <NavMenu>
        {menuData.map((item, index) =>(
          <NavLink to={item.link} key={index}>
            {item.title}
          </NavLink>
        ))}
      </NavMenu>
    </Nav>  
    )
}

export default Header

const Nav = styled.nav`
background: transparent;
height: 80px;
display: flex;
justify-content: space-between;
padding: 1rem;
z-index: 100;
position: relative;
`
const NavLink = styled(Link)`
color: #fff;
display: flex;
align-items: center;
text-decoration: none;
padding: 0 1rem;
height: 100%;
cursor: pointer;
`
const Bars = styled(FaBars)`
display: none;

@media screen and (max-width: 767px) {
  display: block;
  color: #fff;
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(-100%, 75%);
  font-size: 1.8rem;
  cursor: pointer;
}
`
const NavMenu = styled.div `
display: none;

@media screen and (min-width: 768px) {
display: flex;
align-items: center;
}
`