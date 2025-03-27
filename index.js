import { config } from "dotenv"
import express from "express"
import * as sass from "sass"
import createNunjucksRenderer from "./lib/nunjucksRenderer.js"
import { createPostsTree, flattenTree } from "./lib/postTraverser.js"
import fs from "fs"
import YAML from "yaml"

// Set up constants
config()

/**
 * The directory where all the content, media, and settings for the site are stored.
 * @type {string}
 */
const CONTENT_DIR = process.env.CONTENT_DIR ?? "."

/**
 * The directory where the compiled static site will be stored.
 * @type {string}
 */
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "./out"

/**
 * @typedef {"dev" | "build"} RunOption
 */

/**
 * Expected run options.
 * @type {RunOption}
 */
const runOption = process.argv[2]

/**
 * Mapping of run options to their specific "main function".
 * @type {Object.<RunOption, () => void>}
 */
const runFuncs = {
    dev,
    build
}

// Check that the run option is valid, else error.
if (runFuncs[runOption]) {
    runFuncs[runOption]()
} else {
    console.log(`Invalid option: ${runOption}`)
    console.log(`Valid options: ${Object.keys(runFuncs).join(", ")}`)
}

/**
 * Runs a development server that will load stuff directly from the filesystem without building.
 */
function dev() {
    const app = express()

    const renderer = createNunjucksRenderer(`${CONTENT_DIR}/views`, app)

    app.use("/static/media", express.static(`${CONTENT_DIR}/media`))
    app.use("/static/fonts", express.static(`${CONTENT_DIR}/fonts`))

    app.get("/", (req, res) => {
        res.render("pages/index.njk")
    })

    app.get("/static/styles/theme.css", (req, res) => {
        const css = sass.compile(`${CONTENT_DIR}/scss/main.scss`, { style: "compressed" })
        return res.type("text/css").send(css.css)
    })

    app.get("/posts/*", (req, res) => {
        if (!fs.existsSync(`${CONTENT_DIR}/${req.path}.md`)) {
            return res.status(404).send("Sorry no exists!")
        }

        // Read markdown and frontmatter
        const fileContent = fs.readFileSync(`${CONTENT_DIR}/${req.path}.md`, "utf-8")
        const [, frontmatter, ...markdownArray] = fileContent.split(/^---$/gm)
        const markdown = markdownArray?.join("---")
        const context = YAML.parse(frontmatter ?? "")

        res.send(renderer.renderString(fs.readFileSync("./resources/markdown.njk", "utf-8"), { ...context, markdown }))
    })

    app.get("/sitemap", (req, res) => {
        const posts = flattenTree(createPostsTree(`${CONTENT_DIR}/posts`))
        res.json(posts)
    })

    app.listen(12345, () => {
        console.log("Listening on port 12345")
    })
}

/**
 * Compiles all data into a static site.
 */
function build() {
    console.log("build")
    console.log(OUTPUT_DIR)
}
