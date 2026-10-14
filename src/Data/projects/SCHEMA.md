# Project content format

Each project JSON creates its main page at `/<project-slug>`. Add optional entries to `pages` to create matching child routes at `/<project-slug>/<page-slug>`.

Project and child-page images can live in the same folder as the JSON. Reference them with a relative path such as `"image": "./harbor-search.png"`. Absolute public paths and full URLs continue to work.

```json
{
  "slug": "project-name-info",
  "name": "Project name",
  "category": "Knowledge & AI",
  "status": "Deployed MVP",
  "intro": "A concise introduction.",
  "image": "./project-hero.png",
  "imageAlt": "Description of the project image",
  "tryHere": {
    "label": "Try it here",
    "href": "https://example.com/demo",
    "external": true
  },
  "overview": [
    "A normal text-only blurb still works.",
    {
      "text": "A blurb can optionally include its own link and image.",
      "tryHere": {
        "label": "Try this feature",
        "href": "https://example.com/feature",
        "external": true
      },
      "image": "./feature.png",
      "imageAlt": "Description of the feature image",
      "caption": "An optional caption."
    }
  ],
  "pages": [
    {
      "slug": "how-retrieval-works",
      "title": "How retrieval works",
      "summary": "Short text used on the deeper-dive link card.",
      "category": "Recall Harbor deep dive",
      "intro": "The introduction to this child page.",
      "image": "./retrieval.png",
      "imageAlt": "Description of the retrieval interface",
      "overview": [
        "Child pages accept the same content fields as the main project page."
      ],
      "tryHere": {
        "label": "Try retrieval",
        "href": "https://example.com/retrieval",
        "external": true
      }
    }
  ]
}
```

`tryHere`, images, captions, child-page facts, highlights, challenge, approach, next text, and primary actions are optional. When a child page omits a field, it inherits that field from the main project.

An optional `seoDescription` provides a search and sharing description without changing the visible intro. Project and child pages otherwise use their own `intro` or `summary`. Every project and child page is included in the production HTML build and sitemap automatically.

## Optional Stripe listing

Add a Stripe Payment Link to a project to show its product name, current pricing, and a checkout link on the homepage card and project page:

```json
"stripe": {
  "paymentLink": "https://buy.stripe.com/yourActualPaymentLink",
  "paymentLinkId": "plink_yourActualPaymentLinkId",
  "label": "Buy the desktop app"
}
```

Replace the example values with your actual Stripe listing. `paymentLink` is required. The optional `paymentLinkId` avoids searching the Stripe account's Payment Links; it must identify the same URL. `label` overrides the purchase link text. A Stripe product or price ID alone is not a checkout destination, so use a Payment Link.

Pricing comes from the configured catalog endpoint, not the JSON. Do not add amounts or Stripe API keys to project files. The offer shows currency and billing frequency when a fixed price can be displayed accurately; variable, tiered, or usage-based listings direct visitors to checkout for pricing. Taxes and shipping are confirmed at checkout. An inactive listing has no purchase link, and a failed price lookup does not display an invented amount.

Child pages inherit their project's listing. Set `"stripe": null` on a child page to hide it, or provide a different `stripe` object to use another listing. Omit `stripe` on projects without a listing; their existing cards stay unchanged.

See the repository README for the catalog endpoint, local synthetic preview, and future deployment setup. The synthetic preview never adds a listing to the public portfolio.
