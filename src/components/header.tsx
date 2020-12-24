import {subTitleClass, textClass, titleClass} from './../util/fonts'
import {Container, Row, Col} from 'react-bootstrap'
import './header.scss'
import {bigIdea, smallerIdea} from'./../data/header'
import {collapseLinksInText} from './../util/formatters'
import { Markup } from 'interweave';


interface HeaderProps {
    changeTheme: ()=>void
}

function Header(props: HeaderProps) {
    return (
        <Container>
            <Row className="pad-above-row">
                <Col md={{ span: 8, offset: 2 }}>
                    <Row>
                        <Col xs={{ span: 7 }} sm={{ span: 6 }} md={{ span: 6 }}>
                            <p className={subTitleClass}> Jayant Shrivastava </p>
                        </Col>

                        <Col xs={{ span: 5 }} sm={{ span: 6}} md={{ span: 6}}>
                            <p id="change-theme" className={textClass} onClick={props.changeTheme}>
                                <u> Change Theme </u>
                            </p>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row className="pad-above-row">
                <Col md={{ span: 8, offset: 2 }}>
                    <p className={titleClass}> {bigIdea}  </p>
                </Col>
            </Row>
            <Row className="pad-above-row">
                <Col md={{ span: 8, offset: 2 }}>
                    <div className={textClass}>
                        <Markup content={collapseLinksInText(smallerIdea, textClass)}/>
                    </div>
                </Col>
            </Row>
        </Container>

    )
}

export default Header