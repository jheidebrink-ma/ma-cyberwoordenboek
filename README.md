# Cyberwoordenboek · Mediacollege Amsterdam

Een toegankelijk, responsief woordenboek voor studenten met 757 termen uit **DigiTaal Cyberwoordenboek voor onderwijs & onderzoek**. Zoeken door termen en uitleg, alfabetfilters, gerelateerde begrippen, deelbare links en een inzendformulier. Geen database, betaalde dienst of externe JavaScript-dependencies nodig.

## Lokaal ontwikkelen

Gebruik Node.js 22 of hoger (getest met 24).

```sh
npm test
npm run build
npm run dev
```

De ontwikkelserver gebruikt poort 4173 (instelbaar via `PORT`). Bouw opnieuw na wijzigingen aan de bronbestanden en ververs de browser. `dist/` is gegenereerd en staat buiten Git. Lokaal bevat de site de geïmporteerde termen; goedgekeurde GitHub-inzendingen worden bij de online build opgehaald.

## Online publiceren

1. Plaats deze bestanden op de `main`-branch van `jheidebrink-ma/ma-cyberwoordenboek`.
2. Schakel GitHub Issues in. Kies in **Settings → Pages → Build and deployment → Source** voor **GitHub Actions**.
3. De workflow `Woordenboek beoordelen en publiceren` test, bouwt en publiceert de site naar GitHub Pages. De URL verschijnt bij de deployment in GitHub.
4. Bescherm `main` met een ruleset: wijzigingen via pull requests, een review van een code-eigenaar en geen omzeiling door andere medewerkers. Beperk schrijfrechten tot vertrouwde beheerders. Bescherm in het bijzonder `data/owners.json`, de workflow en de buildcode; iemand die deze bestanden mag veranderen kan de goedkeuringsregels aanpassen.

Publicatie is voorbereid, maar moet nog op GitHub worden uitgevoerd. Een lokale build is geen bewijs van een geslaagde GitHub Pages-deployment.

## Termen voorstellen en accepteren

Studenten raadplegen de site zonder account. Voor inzenden is een GitHub-account nodig:

1. Klik **Term toevoegen**, vul term en uitleg in en open het voorstel op GitHub.
2. Controleer de ingevulde issue en dien deze daar in. De term is nog niet zichtbaar in het woordenboek.
3. De workflow reageert met een goedkeuringscommando dat een SHA-256 van de exacte issue-inhoud bevat.
4. **brdev** of **jheidebrink-ma** plaatst dit commando als reactie: `/accepteer <hash>`.
5. De workflow controleert de auteur, de exacte inhoud en de laatste beslissing, en publiceert de geaccepteerde term. `/afwijzen <hash>` trekt een goedkeuring in.

De toegestane beoordelaars staan in `data/owners.json`. Dit is een expliciete lijst, geen automatische afleiding uit GitHub-rollen. Hoofdletters in gebruikersnamen worden genegeerd. Andere gebruikers kunnen een term niet activeren. Bewerken van een issue na goedkeuring vereist nieuwe goedkeuring. Alleen issues met een titel die begint met `[Term]` en de velden uit het issueformulier worden verwerkt. Een gesloten issue met een geldige goedkeuring blijft gepubliceerd. Een dubbele term overschrijft geen bestaande definitie; aanpassingen aan bestaande termen verlopen via een beoordeelde pull request.

Elke beslissing wordt zichtbaar na een **geslaagde deployment**. Bij een mislukte build blijft de vorige site staan; ook een ingetrokken term kan dan nog op die versie staan. Controleer bij wijzigingen de workflow-uitkomst. Issues en reacties zijn openbaar als de repository openbaar is; deel geen persoonsgegevens.

## Inhoud en huisstijl

`data/terms.json` bevat de uit de pdf geïmporteerde termen met bronpagina’s en gerelateerde termen. De tekst is behouden; afgebroken regels en zachte afbreektekens zijn samengevoegd. Dit is een geautomatiseerde import, geen inhoudelijke redactie. De originele pdf staat in `public/bron/` zodat uitleg en bronpagina’s controleerbaar blijven.

Bron: SURF en Cybersave Yourself, **DigiTaal Cyberwoordenboek**, oktober 2025. Auteurs: Rosanne Pouw en Thijs Kinkhorst. Gebaseerd op het Cyberwoordenboek van Cyberveilig Nederland i.s.m. ECP. Licentie: [Creative Commons Naamsvermelding 4.0 Internationaal](https://creativecommons.org/licenses/by/4.0/deed.nl). De website vermeldt de bron en de digitale bewerking.

De vormgeving is afgestemd op [ma-web.nl](https://www.ma-web.nl/): magenta `#FF00E6`, zwart, wit/lichtgrijs en schreefloze typografie. Het officiële woordmerk is afkomstig van `https://www.ma-web.nl/static/images/logo/secondary-logo.png` en staat lokaal in `public/assets/`. Het ma-logo in het roze vlak komt van `https://www.ma-web.nl/static/images/logo/primary-logo.png`. Knoppen en geopende vensters animeren gedurende 0,5 seconde; letterfilters scrollen naar het termenoverzicht. De instelling voor minder beweging wordt gerespecteerd. De site gebruikt Helvetica/Arial als systeemlettertypen; het officiële Akzidenz Grotesk-webfont is niet meegeleverd. Er worden geen externe fonts of tracking geladen.

## Validatie

`npm test` controleert de import, formuliertekst, toegestane beoordelaars, ongeautoriseerde goedkeuring, bewerken na goedkeuring, intrekken en dubbele termen. Daarnaast is de site met Chromium gecontroleerd op zoeken, alfabetfilters, details, directe links, formulieroverdracht en mobiele weergave.
