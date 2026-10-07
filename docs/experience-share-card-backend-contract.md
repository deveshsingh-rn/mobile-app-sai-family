# Experience Share Card Backend Contract

## Goal

Sharing an Experience from the mobile app must produce a rich preview in
WhatsApp and other services that support Open Graph metadata.

The mobile app shares this canonical public URL:

```text
https://saifamily.sustaininsight.com/experiences/:experienceId
```

## Required Public Route

```http
GET /experiences/:experienceId
```

This route must be public and return server-rendered `text/html`. It must not
return API JSON or require authentication.

Required metadata:

```html
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Sai Family" />
<meta property="og:title" content="Experience shared by AUTHOR_NAME" />
<meta property="og:description" content="SAFE_TRUNCATED_CONTENT" />
<meta property="og:url" content="CANONICAL_URL" />
<meta property="og:image" content="PUBLIC_ABSOLUTE_IMAGE_OR_THUMBNAIL_URL" />
<meta name="twitter:card" content="summary_large_image" />
```

Use the post image or published video thumbnail when available. For text-only,
audio, processing-video, or missing-media posts, use a permanent Sai Family
fallback image with a public HTTPS URL and a `1200x630` aspect ratio.

## Safety And Performance

- Expose only published, non-deleted Experience data.
- Never expose phone numbers, email addresses, internal storage paths, or
  private profile data.
- Escape all database values inserted into HTML.
- Return metadata in the initial HTML response; crawlers may not run JavaScript.
- Use `Cache-Control: public, max-age=300, stale-while-revalidate=3600`.
- Invalidate cached metadata after content/media updates or deletion.
- Target a cached response below 300 ms.

The page should contain an `Open in Sai Family` action using:

```text
saifamily://experiences/:experienceId
```

## Acceptance Test

1. Open the public URL in an incognito browser without authentication.
2. Confirm the response is HTML and contains all required `og:*` metadata.
3. Confirm `og:image` is an absolute public HTTPS image URL.
4. Share a new URL in WhatsApp and confirm image, author, description, and
   domain appear as a rich card.
5. Tap the card and verify the Experience opens in the app or public fallback.

WhatsApp caches previews. Use a new Experience ID while testing metadata
changes.
