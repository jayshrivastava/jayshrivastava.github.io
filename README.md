# Personal Website

### Requirements

Node Version: v20 or newer

NPM Version: v10 or newer

### CI

`npm run lint` should pass.

### `npm start`

Serves the static site locally.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Refresh the page after making edits.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Renders Markdown posts and copies the static site into the `build` folder for deployment.

### `npm run watch`

Rebuilds the static site whenever a Markdown post or the Markdown renderer changes. Run it
alongside `npm start`, then refresh the browser after saving an edit.

### Writing

Edit [`content/blog/cuda-streams.md`](content/blog/cuda-streams.md) to update the CUDA streams
post. Its frontmatter controls the title, date, subtitle, and page description. Keep the
`{{single_stream_animation}}`, `{{tokio_poll_animation}}`, and `{{multi_stream_animation}}`
placeholders where the three animated diagrams should appear.
