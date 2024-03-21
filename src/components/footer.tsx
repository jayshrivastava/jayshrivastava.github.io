import {textClass} from './../util/fonts'
import {Container, Row, Col} from 'react-bootstrap'

function Footer() {
    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col className="d-flex justify-content-center">
                     <p className={textClass}> Made with 🍗🥡🌯🍣🍔 in Markham, Ontario, Canada. </p>
                </Col>
            </Row>
        </Container>
    )
}

export default Footer