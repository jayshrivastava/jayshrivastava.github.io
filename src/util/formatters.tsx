// collapseLinksInText inlines mardown-style hyperlinks in text.
// Eg. "check out this [link](url)" => "check out this <a class=${className} href=${link}><u>${text}</u></a>`"
// To safely use the text containing tsx as tsx, use the Markup component: import { Markup } from 'interweave'.
//
// TODO: Change this function to return TSX instead of a string.
export const collapseLinksInText = (target :string, className: string) : string => {
    const linkString = (text: string, link: string) => {
        return (
            `<a class=${className} href=${link}><u>${text}</u></a>`
        )
    }

    const openBracketsWithCharsInside = /\[(.|\/|:|\.)+\]/g
    const closedBracketWithLinkInside = /\(.+\)/g
    const openBracketsWithCharsInsideSingle = /\[.+\]/

    const placeholders = [...target.matchAll(openBracketsWithCharsInside)]

    const links = [...target.matchAll(closedBracketWithLinkInside)]

    if (links.length !== placeholders.length) {
        console.error("The number of links and placeholders in target text do not match:\n", target)
        return target
    }

    // Avoid using e.replaceAll() because it is not supported on old browsers nor on certain mobile browsers.
    let prev = target
    target = target.replace(closedBracketWithLinkInside, "")
    while (target !== prev) {
        prev = target
        target = target.replace(closedBracketWithLinkInside, "")
    }

    for (let i = 0; i < placeholders.length; i++) {
        target = target.replace(
            openBracketsWithCharsInsideSingle,
            linkString(
                placeholders[i][0].substring(1,placeholders[i][0].length-1),
                links[i][0].substring(1,links[i][0].length - 1)
            )
        )
    }

    return target
}