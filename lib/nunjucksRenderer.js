import { marked } from "marked"
import nunjucks from "nunjucks"
import nunjucksMarkdown from "nunjucks-markdown"

/**
 * Creates a Nunjucks renderer.
 * @param {string} templatePath The path to the templates.
 * @param {import("express").Application} expressApp The express app.
 * @returns {import("nunjucks").Environment}
 */
export default function createNunjucksRenderer(templatePath, expressApp) {
    const nunjucksEnvironment = nunjucks.configure(
        templatePath,
        {
            autoescape: true,       // Automatically escape HTML aka a '<' will become '&lt;'
            watch: true,            // Automatically reload all templates if they change on disk.
            trimBlocks: true,       // Remove trailing newlines from tags
            lstripBlocks: true,     // Automatically remove leading whitespace from tags
            express: expressApp,    // Use the express server.
        }
    )

    const markedRenderer = createMarkedRenderer()

    nunjucksMarkdown.register(nunjucksEnvironment, markedRenderer)

    return nunjucksEnvironment
}
/**
 * Custom renderer for marked.
 * @returns {import("marked").Marked}
 */
function createMarkedRenderer() {
    const customRenderFunctions = {
        // Rendering of headings (add an anchor above all headings).
        heading({ tokens, depth, text }) {
            const parsedText = this.parser.parseInline(tokens)
            const id = text.toLowerCase().replace(/[åä]/g, "a").replace(/ö/g, "o").replace(/\s+/g, "-")

            return `
            <h${depth}>
                <a id="${id}" data-orig-text="${text}" href="#${id}"><span class="header-anchor-link"></span></a>
                ${parsedText}
            </h${depth}>
        `
        },
    }

    // Configure marked (markdown parser)
    marked.use({
        gfm: true,                  // Use GitHub formatting?
        renderer: customRenderFunctions,   // Use my own custom rendering for som tags
        mangle: false,              // Remove deprecated warning
        headerIds: false,           // Remove deprecated warning
        headerPrefix: false         // Remove deprecated warning
    })

    return marked
}
