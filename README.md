# Phadima Percival Maredi portfolio

Source for [prof-percival.github.io](https://prof-percival.github.io), the software engineering portfolio of Phadima Percival Maredi.

## Development

Use Node from `.node-version`, then install dependencies:

```sh
npm ci
```

Start the local server in managed background mode on loopback:

```sh
npm run dev -- --background --host 127.0.0.1
```

Check or stop it with `npm exec -- astro dev status` and `npm exec -- astro dev stop`.

Run the required checks:

```sh
npm run verify
npm run test:coverage
npm run test:e2e
npm audit --omit=dev --audit-level=high
```

## Updating content

- Edit identity, links, the current role, and the Formspree endpoint in `src/data/site.ts`.
- Edit experience, projects, capabilities, education, credentials, languages, and community work in `src/data/portfolio.ts`.
- Replace `public/resume/percival-maredi-cv.pdf` with the current CV while keeping the public filename stable.
- Keep claims traceable to a public profile, CV, credential, or inspected project source. Do not add private employer or customer material.
- Run the full verification commands above before publishing.

## Contact and analytics

The contact form posts to the dedicated Formspree endpoint in `src/data/site.ts`. Browser tests mock provider responses and must never send a real message.

GoatCounter stays disabled unless `PUBLIC_GOATCOUNTER_ENDPOINT` is configured at build time. Copy `.env.example` to `.env` for local development and use a public endpoint in this form:

```dotenv
PUBLIC_GOATCOUNTER_ENDPOINT=https://your-site-code.goatcounter.com/count
```

The analytics script validates HTTPS and the GoatCounter hostname, and it loads only on `prof-percival.github.io`. No service secret belongs in this repository.

## Deployment

Pushes to `main` run CI and deploy the static Astro build through GitHub Pages. The deployment workflow owns the published artifact; do not commit `dist/`.
