# LåtQuiz – versjon 1.3

Mobiltilpasset musikkquiz for én quizmaster. Ingen Spotify-API, server eller innlogging er nødvendig.

## Oppdatert spørsmålsbank

- **354 låter totalt** (tidligere 90), med ett tilleggsspørsmål og fasit til hver låt.
- **112 låter fra 90-tallet** og **135 fra 2000–2009**.
- **52 norske partylåter**, blant annet Staysman & Lazz, TIX, Freddy Kalas, Katastrofe, Hagle, Ringnes-Ronny og Ballinciaga.
- Nye kategorier: **2000-tallet** og **Partymusikk**. Fortsatt country, pop, rock, 80-tallet, 90-tallet, norsk og litt av alt.
- Maks **2 poeng per låt** (artist + tilleggsspørsmål). Navn og tittel skjules til fasit vises.
- Artistspredning ved uttrekk, slik at du normalt slipper flere låter fra samme hovedartist i én quiz.

## Oppdatere GitHub Pages

1. Pakk ut ZIP-filen. Du finner seks filer: `index.html`, `app.js`, `data.js`, `style.css`, `favicon.svg`, `README.md`.
2. Gå til **samme GitHub-repository** du bruker i dag (`laatquiz`).
3. Velg **Add file → Upload files** og last opp alle seks filene. Erstatt filene med samme navn.
4. Trykk **Commit changes**. GitHub Pages publiserer automatisk. Du trenger ikke opprette repository på nytt.
5. Åpne siden på nytt, helst med en hard oppdatering om den viser gamle filer. Versjonsnummeret nederst skal være **v1.3**.

## Spotify-lenker

De opprinnelige direkte Spotify-låtlenkene er beholdt. **Nye låter åpner et vanlig Spotify-søk** etter artist og sangtittel; velg riktig låt i trefflisten. Søkelenker er brukt bevisst for ikke å legge inn uverifiserte Spotify-låt-ID-er. Med tiden kan du legge til direkte Spotify-ID-er i `data.js` uten å endre appen.

Vanlige Spotify-lenker kan åpne en fane eller Spotify-appen. Det er ikke garantert at avspilling starter av seg selv, og Spotify viser artist og tittel i sin egen app.

## Videre utvidelser

Alle sangene ligger som enkle oppføringer i `data.js` (`id`, `artist`, `title`, `year`, `genres`, `question`, `answer`, valgfri `spotifyId`). Flere sanger kan legges til når som helst uten endring av selve nettsiden. `90-tallet` og `2000-tallet` sorteres på årstall, mens `Partymusikk` bruker sjangermerket `party`.

Den er laget som et uavhengig hobbyprosjekt og er ikke tilknyttet Spotify. Offentlig eller kommersiell musikkavspilling kan kreve egne rettigheter.
