# Marco & Nadeen — Wedding Invitation Website

A premium, single-page wedding invitation built with plain HTML5, CSS3, and
vanilla JavaScript — no frameworks, no build step. Just open `index.html`.

## Folder structure

```
WeddingInvitation/
│
├── index.html          All markup / sections
├── style.css            Design tokens + every section's styles
├── script.js             Loader, countdown, gallery, RSVP, confetti, etc.
├── README.md
│
└── assets/
    ├── bride.jpg         Nadeen's portrait (couple section, circular crop)
    ├── groom.jpg         Marco's portrait (couple section, circular crop)
    ├── gallery1.jpg       Gallery photo
    ├── gallery2.jpg       Gallery photo
    ├── gallery3.jpg       Gallery photo
    ├── gallery4.jpg       Gallery photo (Groom)
    ├── gallery5.jpg       Gallery photo (Bride)
    ├── music.mp3          Ambient background track (trimmed to loop)
    └── icons/             Reserved for any extra custom icons you add
```

## Running it

Just double-click `index.html`, or for the most accurate experience
(autoplay/audio permissions behave more predictably over http://), serve the
folder locally:

```bash
cd WeddingInvitation
python3 -m http.server 8080
# then open http://localhost:8080
```

## What's already wired up

- **Live countdown** to October 11, 2026, 7:00 PM — edit the date by
  changing `data-wedding-date` on `#countdownGrid` in `index.html`.
- **Gallery** — auto-advancing slider, dot navigation, and a full lightbox
  with keyboard (←/→/Esc) and click navigation.
- **RSVP**
  - *Accept Invitation* opens WhatsApp (desktop web, Android, and iPhone all
    supported via `wa.me`) with a pre-filled message, sent to
    `+20 155 155 3557`. Change the number and message text at the top of the
    `RSVP` section in `script.js` (`WHATSAPP_NUMBER` / `WHATSAPP_MESSAGE`).
  - *Decline* just shows a warm inline message — no external navigation.
- **View Location** button — currently points to a generic Google Maps
  search for "El Qasr Mall". Swap in your real pin: open Google Maps, share
  the venue, copy the link, and paste it as the `href` on `#viewLocationBtn`.
- **Ambient music** — starts when a guest taps "Open Invitation", and can be
  muted anytime with the sound toggle (top-right). Swap `assets/music.mp3`
  for your own track — keep it short (30–90s); it loops seamlessly.
- **Confetti + floating hearts** fire once, automatically, the first time a
  guest scrolls into the Thank You section.
- **Scroll reveal** — every section fades/slides in via `IntersectionObserver`
  (`.reveal` class); respects `prefers-reduced-motion`.

## Customizing content

- Names, date, time, and venue are plain text in `index.html` — search for
  "Marco Atif", "Nadeen Assem", "October 11, 2026", "El Qasr Mall". The groom
  is always displayed first, per the couple's request — keep that order if
  you edit any of the name occurrences.
- Timeline entries are the four `.timeline-item` blocks under `#timeline`.
- To add a real 6th gallery photo, drop it in `assets/`, then duplicate a
  `<li class="gallery-item">` block in `#galleryTrack` and add a matching
  dot will be generated automatically (dots are built from JS, no manual
  edit needed there).

## Browser support

Modern evergreen browsers (Chrome, Safari, Firefox, Edge). Uses
`IntersectionObserver`, CSS `clamp()`, `backdrop-filter`, and the Canvas 2D
API — all broadly supported since ~2021.
