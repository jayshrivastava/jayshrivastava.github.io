export const collapseLinksInText = (target :string, className: string) => {
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

    target = target.replaceAll(closedBracketWithLinkInside, "")

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