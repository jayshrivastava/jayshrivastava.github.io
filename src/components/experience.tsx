
import {textClass, codeClass, subTitleClass} from './../util/fonts'
import { Markup } from 'interweave';
import {collapseLinksInText} from './../util/formatters'

interface ExperienceProps {
    company: string
    position: string
    start: string
    end: string
    summary: string
}

function Experience(props : ExperienceProps) {
    return (
        <div >
            <p className={subTitleClass}> {props.company} </p>
            <p className={codeClass} > {props.position} </p>
            <p className={codeClass} > {`[${props.start}, ${props.end}]`} </p>
            <div className={textClass}>
                <Markup content={collapseLinksInText(props.summary, textClass)}/>
            </div>
            <p/>
        </div>
    )
}

export default Experience
