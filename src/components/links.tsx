import {links} from './../data/links'
import {textClass, highlightedClass} from './../util/fonts'
import {Container, Row, Col} from 'react-bootstrap'
import {useState} from 'react'
import './links.scss'

function Links() {
    const [selectedDisplayLink, setSelectedDisplayLink] = useState("")

    return (
        <Container>
            <Row className="pad-above-row">
                <Col md={{ span: 8, offset: 2 }}>
                    {
                        links.map((link, idx) => {
                            return (
                                <Row key={idx}>
                                    <Col xs={{ span: 2 }} sm={{ span: 2 }} md={{ span: 2 }} lg={{ span: 1 }}>
                                        <a
                                            onMouseEnter={()=>{setSelectedDisplayLink(link.displayLink)}}
                                            onMouseLeave={()=>{setSelectedDisplayLink("")}}
                                            className={textClass}
                                            target="_blank"
                                            href={link.link}> {link.text}
                                        </a>
                                    </Col>
                                    <Col xs={{ span: 10 }} sm={{ span: 10 }} md={{ span: 10 }} lg={{ span: 11 }}>
                                        <p
                                            className={[
                                                "display-link", textClass,
                                                selectedDisplayLink === link.displayLink ? highlightedClass : ""
                                            ].join(" ")}>
                                            {link.displayLink}
                                        </p>
                                    </Col>
                                </Row>
                            )
                        })
                    }
                </Col>
            </Row>
        </Container>
    )
}

export default Links