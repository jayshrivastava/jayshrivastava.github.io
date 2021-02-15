import './home.scss'
import {useState} from "react"
import Experiences from '../components/experiences'
import Links from '../components/links'
import Header from '../components/header'
import Footer from '../components/footer'
import {Container, Row} from 'react-bootstrap'

const lightValue = "light"
const darkValue = "dark"
const localStorageThemeKey = "jayshrivastava.theme"

const setLocalStorage = (key: string, value: string) => {
    if (navigator.cookieEnabled) {
        localStorage.setItem(key, value)
    }
}

const getLocalStorage = (key: string) => {
    if (navigator.cookieEnabled) {
        return localStorage.getItem(key)
    }
    return null
}

function Home() {
    const [theme, setTheme] = useState(lightValue)

    // Sync the theme with session storage.
    const sessionTheme = getLocalStorage(localStorageThemeKey)
    if (sessionTheme === null) {
        setLocalStorage(localStorageThemeKey, theme)
    } else if (sessionTheme !== theme) {
        setTheme(sessionTheme)
    }

    const toggleTheme = () => {
        if (theme === lightValue) {
            setLocalStorage(localStorageThemeKey, darkValue)
            setTheme(darkValue)
        } else {
            setLocalStorage(localStorageThemeKey, lightValue)
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
