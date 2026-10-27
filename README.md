# LåtQuiz – versjon 1.1

En mobiltilpasset musikkquiz som fungerer som statisk nettside. Ingen installasjon, brukerregistrering, Spotify-API eller server kreves.

## Publiser via GitHub Pages

1. Lag et **nytt, offentlig GitHub-repository** (for eksempel `laatquiz`).
2. Last opp **alle filene i denne mappen til roten** av repositoryet: `index.html`, `style.css`, `app.js`, `data.js` og `favicon.svg`.
3. Gå til **Settings → Pages** i GitHub-repositoryet.
4. Velg **Deploy from a branch**, `main`, og `/ (root)`. Lagre.
5. Åpne URL-en GitHub Pages oppgir. Nettsiden fungerer på mobil.

Du kan også åpne `index.html` direkte i en nettleser uten å publisere den. Enkelte mobilnettlesere krever publisering for å håndtere eksterne Spotify-lenker smidig.

## Funksjoner

- Country, pop, rock, 80-tallet, 90-tallet, norsk musikk og litt av alt.
- 5, 10 eller 15 tilfeldig valgte spørsmål.
- To poeng per låt (1 for artist, 1 for tilleggsspørsmål), skjult fasit til begge, neste spørsmål og bytte av enkeltlåt.
- 90 redigerbare låter, med spørsmål og svar i `data.js`.
- Vanlige lenker som åpnes i Spotify. På laptop forsøker nettleseren å gjenbruke samme Spotify-fane i stedet for å opprette en ny for hver låt. Verifisert låt-ID brukes der den finnes; ellers Spotify-søk etter artist og tittel.
- Quizen lagres lokalt i nettleseren, også dersom du bytter til Spotify og kommer tilbake.
- Utvalg prioriterer låter du ikke har fått i nylige quizer. Ingen innlogging.

## Oppdater fra versjon 1.0

Bare last opp de oppdaterte `app.js`, `data.js`, `style.css` og `README.md` til samme GitHub-repository og erstatt de eksisterende filene. `index.html` og `favicon.svg` er uendret og kan også lastes opp igjen om ønskelig. Eksisterende quizer fungerer fortsatt fordi sangenes ID-er er beholdt.

Alle 90 tilleggsspørsmål er gjennomgått for direkte avsløring av artisten eller gruppen. Spørsmål og svar kan enkelt redigeres i `data.js`.

## Merk om musikklenkene

For en låt med `spotifyId` går lenken direkte til `https://open.spotify.com/track/<spotifyId>`. Hvorvidt avspillingen starter automatisk avhenger av Spotify-appen, mobilen og avspillingsstatus. Enkelte nettlesere kan likevel åpne en ny fane eller overføre deg til Spotify-appen; dette kan ikke styres fullt ut fra en vanlig nettlenke. For øvrige låter åpnes et Spotify-søk – velg riktig innspilling manuelt. Låtlenker kan slutte å virke eller gi regionbegrensninger; de må vedlikeholdes ved behov.

Du kan legge inn flere eksakte Spotify-lenker: Åpne låten i Spotify → Del → Kopier lenke. Kopier delen mellom `/track/` og `?` til feltet `spotifyId` for den aktuelle sangen i `data.js`.

## Tilpass låtene

Hvert element i `SONGS` i `data.js` har: `id`, `artist`, `title`, `year`, `genres`, `question`, `answer` og eventuelt `spotifyId`. Kategorien `80-tallet` og `90-tallet` bestemmes automatisk av `year`. For øvrige kategorier brukes `genres`.

Legg til nye elementer med unike id-er. Kontroller fakta i spørsmålene, og ikke skriv artistens eller gruppens navn i spørsmålet – deltakerne skal først gjette artisten for ett poeng. Hele appen kjører kun lokalt i browseren; ingen opplysninger eller quizer sendes til en server.

## Viktig

Denne nettsiden er et uavhengig hobbyprosjekt og er ikke laget eller godkjent av Spotify. Det brukes ingen Spotify-API-er, embedded avspillere eller Spotify-strømmer i appen. Låtene spilles i Spotify på brukerens eget abonnement. Spotify kan begrense avspilling og den enkelte brukeren må følge Spotifys vilkår, inkludert begrensningen mot offentlig/kommersiell avspilling.
