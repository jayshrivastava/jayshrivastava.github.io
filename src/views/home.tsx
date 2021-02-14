import './home.scss'
import {useState} from "react"
import Experiences from '../components/experiences'
import Links from '../components/links'
import Header from '../components/header'
import Footer from '../components/footer'
import {Container, Row} from 'react-bootstrap'


const lightValue = "light"
const darkValue = "dark"
const sessionThemeKey = "jayshrivastava.theme"

function Home() {
    const [theme, setTheme] = useState(lightValue)

    // Sync the theme with session storage.
    const sessionTheme = sessionStorage.getItem(sessionThemeKey)
    if (sessionTheme === null) {
        sessionStorage.setItem(sessionThemeKey, theme)
    } else if (sessionTheme !== theme) {
        setTheme(sessionTheme)
    }

    const toggleTheme = () => {
        if (theme === lightValue) {
            sessionStorage.setItem(sessionThemeKey, darkValue)
            setTheme(darkValue)
        } else {
            sessionStorage.setItem(sessionThemeKey, lightValue)
            setTheme(lightValue)
        }
    }

    return (
        <div className = {theme} >
            <Container>
                <Row>
                   <Header changeTheme={toggleTheme}/>
                </Row>
                <Row>
                    <Links/>
                </Row>
                <Row>
                    <Experiences/>
                </Row>
                <Row>
                    <Footer/>
                </Row>
            </Container>
        </div>
    )
}

export default Home
