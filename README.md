# Kela Terapeuttihakemiston taustajärjestelmä

Järjestelmä, joka tarjoaa rajapinnan tietokantaan Kelan terapeuttien hakemiseen ja päivittämiseen JSON-muodossa. Yhdistä "raaputtimeen" [https://github.com/telaak/kela-palveluntuottaja-scraper/tree/main](https://github.com/telaak/kela-palveluntuottaja-scraper/tree/main)
## Kuvaus

Järjestelmä käyttää Prismaa (ei se kauppa) yhdistäkseen tietokantoihin (terapeuttihaku.fi käyttää PostgreSQL:ää). Terapeuttien aktiivisuus päivitetään joko sähköpostilla tai tekstiviestillä.
Sähköposteihin hyödynnetään Cloudflaren Email Worker:iä [https://github.com/telaak/terapeuttihaku-email-worker](https://github.com/telaak/terapeuttihaku-email-worker)
Tekstiviesteihin käytetään sarjaporttiyhteyden kautta toimivaa GSM-modeemia ja sille tehtyä ohjelmaa [https://github.com/telaak/serial-gsm-rest](https://github.com/telaak/serial-gsm-rest)
Ohjelmasta on julkinen rajapinta /api/ terapeuttien datan hakemista varten, sekä sisäinen rajapinta /internal/ niiden päivittämistä varten.

### Dokumentaatio

Suurin osa lähdekoodista on kommentoitu, ja kommenteista luotu TypeDoc löytyy osoitteesta [https://terapeuttihaku.fi/docs/kela-backend/](https://terapeuttihaku.fi/docs/kela-backend/)

## Aloittaminen

### Vaatimukset

* Node.js

### Asentaminen

1. `git pull github.com/telaak/kela-terapeutit-backend.git`
2. Asenna paketit `npm i`
3. Luo Prisma-mallit (ei se kauppa) `npx prisma generate`
4. Aja TypeScript compiler `npx tsc`
5. Täytä ympäristömuuttujat:
      * DATABASE_URL (osoite tietokantaan yhdistämistä varten. esim PostgreSQL: `postgresql://user:password@address:port/mydb?schema=public`)
      * PORT (TCP portti jota rajapinnat käyttävät)
      * WEBSOCKET (osoite GSM-rajapinnan WebSocket-yhteyttä varten esim. `wss://osoite/ws/connect`
      * NEXT_URL (osoite Next.js-taulukkosivustoon, taulukon staattista uudelleenluontia varten) esim `https://terapeuttihaku.fi`
      * REVALIDATE_TOKEN (Next.js:n taulukkosivuston uudelleenluonnin "salasana"
      * EMAIL_SECRET (Cloudflare:n Email Worker:n "salasana" sähköpostien tarkastelua varten)
      * CLOUDFLARE_ZONE (Cloudflaren cache:n tyhjentämistä varten)
      * CLOUDFLARE_API_KEY (Cloudflare:n API-avain)
6. Käynnistä ohjelma `node ./dist/index.js`

### Docker

## Build

* `docker build -t username/kela-terapeutit-backend`

## Compose

```
version: '3.8'

services:
    
  backend:
    image: telaaks/kela-terapeutit-backend
    restart: unless-stopped
    environment:
      - DATABASE_URL=
      - PORT=
      - WEBSOCKET=
      - NEXT_URL=
      - REVALIDATE_TOKEN=
      - EMAIL_SECRET=
      - CLOUDFLARE_ZONE=
      - CLOUDFLARE_API_KEY=
    ports:
      - 4000:4000
```

## License

This project is licensed under the MIT License - see the LICENSE.md file for details
