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
