# free-courses

A curated, kept-current list of free online courses that award a certification, relevant to business administration, healthcare, and finance.

The site is plain static HTML/CSS/JS — no build step, no backend. It reads its course list from `data/courses.json` at runtime.

## Viewing locally

Opening `index.html` directly (`file://...`) will not load the data, because browsers block `fetch()` of local files. Serve the folder instead, e.g.:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static file server works. Deploying to GitHub Pages, Netlify, etc. works without changes.

## Adding or updating a course

All course data lives in one file: `data/courses.json`. It's a JSON array; each entry looks like:

```json
{
  "id": "provider-short-slug",
  "title": "Course Title",
  "provider": "Provider Name (School/Partner if relevant)",
  "description": "One sentence describing what the course covers.",
  "fields": ["business"],
  "level": "introductory",
  "certificate": "free",
  "certificateNote": "One sentence explaining the free/paid terms in plain language.",
  "duration": "e.g. 30 hours, self-paced",
  "url": "https://provider.example.com/course/direct-link",
  "verifiedOn": "2026-09-16"
}
```

Field notes:

- `fields`: array containing one or more of `"business"`, `"healthcare"`, `"finance"` (a course can legitimately serve more than one, e.g. healthcare management/administration courses — tag it with all that apply rather than picking one).
- `level`: `"introductory"`, `"intermediate"`, or `"advanced"`. Use your best judgment from the provider's own labeling; omit granularity you don't actually know rather than guessing.
- `certificate`: `"free"` if the certificate itself is free, or `"paid"` if the course is free to take/audit but the certificate costs money or requires a paid subscription. Paid-certificate courses are still worth listing (the captain wants to judge case by case) but **must** be flagged — the site does this automatically from this field, so don't skip it.
- `url`: must be the direct enrollment/course page on the provider's own site — not a search results page, not a redirect, not a third-party summary.
- `verifiedOn`: the date (YYYY-MM-DD) you personally checked the live course page and confirmed it's still enrollable and that the free/paid terms above are current.

**Before adding a course, visit its actual live page and verify:**
1. It's currently offered and enrollable (not archived/retired).
2. It's free to take, or at least free to audit.
3. Whether the certificate is free or paid — check the specific course page, not just the provider's general marketing copy (terms vary course-to-course and change over time; see e.g. Alison, where only a small allowlisted set of courses has a free certificate while most require payment).

Terms like these drift often, so periodically re-check existing entries and bump `verifiedOn` (or remove/update the entry if terms changed).

No other file needs to change to add a course — `assets/app.js` renders whatever is in `data/courses.json`.
