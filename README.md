# Bryant Car Club

Website for the Bryant University student car club, and its flagship event, the Bryant University Car Show 2027.

## Where things live

| What | File |
|---|---|
| Page sections and text | `src/app.jsx` |
| Club meets & events | the `meets` list near the top of `src/app.jsx` (one line per meet, date as `YYYY-MM-DD`); each meet shows up as a stop on the season road |
| Show month on the season road | `SHOW_MONTH` near the top of `src/app.jsx` |
| Club facts (the VIN plate) | the `CLUB_VIN` list near the top of `src/app.jsx` |
| Sponsor garage cars and their photo credits | `GARAGE_CARS` in `src/app.jsx`, photos in `images/garage/` (the footer credits are required by the photo licenses) |
| Show schedule (times) | the `schedule` list near the top of `src/app.jsx` |
| Styles | `src/styles.css` (plus Tailwind classes in `src/app.jsx`) |
| Logo, favicon | `images/` |
| Fonts (Archivo, SIL Open Font License) | `fonts/` |

`app.js` and `styles.css` in the top folder are **generated**. Don't edit them by hand.

## After making a change

You need [Node.js](https://nodejs.org) once. Then, in this folder:

```
npm install      # first time only
npm run build    # rebuilds app.js and styles.css
```

Commit the rebuilt `app.js`, `styles.css` and `index.html` together with your edits, then push.

## Preview on your computer

```
python -m http.server 8000
```

Then open http://localhost:8000. Do a hard refresh (Ctrl+Shift+R) if you don't see your change.
