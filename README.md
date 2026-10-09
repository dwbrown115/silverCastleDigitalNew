# Silver Castle Digital

The current Silver Castle Digital portfolio and independent software practice website.

This React/Vite site presents active projects, earlier work, the agentic building approach, and a contact form. It retains the castle mark, indigo/blue identity, original portfolio records, social links, and EmailJS integration from the latest site while updating the design and current positioning.

## Development

Install dependencies with `npm install`, start the local site with `npm run dev`, and create a production build with `npm run build`.

## Search and sharing

The build renders the homepage and every project and deeper-dive page to static HTML, using the same React components and JSON content as the interactive site. The browser hydrates that HTML and maintains page metadata when navigating between projects.

Titles, descriptions, canonical URLs, Open Graph and Twitter previews, and JSON-LD are generated in `src/seo.js`. The canonical host is `https://www.silvercastledigital.com`. The build also generates `sitemap.xml`, `robots.txt`, and a noindex 404 page. The standalone KJR privacy policy retains its content and layout and receives matching metadata.

Both `route.html` and `route/index.html` are emitted for Amplify's clean URL handling. Do not add a blanket 200 rewrite to `/index.html`: it would replace page-specific HTML with the homepage. Keep a 404 fallback for genuinely missing files. The `_redirects` file is for other static hosts; Amplify redirect rules are managed in its hosting settings.

Adding a project JSON automatically adds its main page and child pages to the static build and sitemap. Add its slug to `projectOrder` in `src/Sections/Projects/index.jsx` to show it on the homepage. An optional `seoDescription` can override the introductory text used for a search snippet.

Run `npm run build && npm run test:seo` to check generated page content, canonical URLs, structured data, sitemap coverage, image paths, safe metadata escaping, and preservation of the policy body. React 18 uses the lowercase `fetchpriority` attribute to prioritize the homepage hero image.

## Contact form

The contact form uses these environment variables when configured:

- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

Without them, submitting opens a prefilled email to `dakota.w.brown@silvercastledigital.com`.
