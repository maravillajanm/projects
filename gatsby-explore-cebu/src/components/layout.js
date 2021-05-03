import * as React from "react"
import Header from "./header"
import {GlobalStyle} from "./styles/GlobalStyles"

const Layout = ({ children }) => {
  return (
    <>
    <GlobalStyle />
      <Header />
      <main>{children}</main>
        
    </>
  )
}

export default Layout
