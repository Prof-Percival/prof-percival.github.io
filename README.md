# Prof. Percival portfolio

Source for [prof-percival.github.io](https://prof-percival.github.io), the portfolio of Phadima Percival Maredi.

## Development

Use Node from `.node-version`, then install dependencies:

```sh
npm ci
```

Start the local server on loopback:

```sh
npm run dev -- --host 127.0.0.1
```

Run the required checks:

```sh
npm run verify
npm run test:e2e
```

## Content and services

Career and project content lives in typed source data. The contact form uses Formspree and analytics use GoatCounter. Public service identifiers are configured separately from private credentials; no secret belongs in this repository.

The site deploys from `main` through GitHub Pages after the final preview is approved.
