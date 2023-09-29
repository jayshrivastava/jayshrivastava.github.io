
import {titleClass} from '../util/fonts'
// import experiences from '../data/experiences.json'
// import Experience from './experience'
import {Container, Row, Col} from 'react-bootstrap'

function Experiences() {
    return (
        <Container>
            <Row className="pad-above-row">
                <Col md={{ span: 8, offset: 2 }}>
                    <p className={titleClass}> Experiences. </p>
                    <p/>
                    {
                        // experiences.map((experience, idx) => {
                        //     return <Experience key={idx}
                        //         {...experience}
                        //     />
                        // })
                    }
                </Col>
            </Row>
        </Container>
    )
}

export default Experiences
