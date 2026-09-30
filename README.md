# Shift Tracker

Een webapp om je werkrooster, gewerkte uren en nachttoeslag bij te houden.

🔗 **Live:** [https://shift-tracker-amber.vercel.app/](https://shift-tracker-xxxx.vercel.app) 

<!-- TODO: voeg een screenshot toe zodra de app draait -->
<!-- ![Screenshot van de app](docs/screenshot.png) -->

## Waarom deze app?

Naast mijn studie-oriëntatie werk ik parttime op Schiphol, met wisselende diensten. Ik wilde overzicht houden over mijn rooster en gewerkte uren, en kunnen narekenen of mijn toeslagen op mijn loonstrook kloppen. Een spreadsheet werd al snel rommelig: diensten lopen soms over middernacht, toeslagen verschillen per tijdvak en feestdagen tellen anders.

Daarom bouw ik deze app: een probleem uit mijn eigen werk, en tegelijk een manier om een complete webapplicatie van begin tot eind te bouwen en live te zetten.

## Functionaliteit

- [ ] Account aanmaken en inloggen
- [ ] Rooster invoeren: geplande diensten (datum, begintijd, eindtijd, pauze)
- [ ] Diensten markeren als gewerkt, met de werkelijke tijden
- [ ] Overzicht van gewerkte uren per week en per maand
- [ ] Automatische berekening van nachttoeslag met instelbare regels
- [ ] Salarisoverzicht: bruto verdiend tot nu toe deze maand
- [ ] Prognose: verwacht bruto maandtotaal als alle geplande diensten gewerkt worden
- [ ] Agenda-koppeling: rooster als abonnement in de iPhone-agenda (iCal-feed)
- [ ] Export naar CSV

### Later misschien

- Schatting van nettoloon
- Rooster importeren
- Herinneringen voor komende diensten
- Ondersteuning voor feestdagentoeslag

## Tech stack

<!-- TODO: pas aan als je andere keuzes maakt -->

| Onderdeel | Technologie |
|-----------|-------------|
| Framework | Next.js (App Router) + TypeScript |
| Backend | Next.js Server Actions en Route Handlers |
| Database | PostgreSQL + Prisma (ORM) |
| Authenticatie | Auth.js |
| Styling | Tailwind CSS |
| Tests | Vitest |
| Hosting | Vercel |
| CI/CD | GitHub Actions |

## Architectuur

```
Browser  ──▶  Next.js (pagina's + Server Actions / Route Handlers)  ──▶  PostgreSQL
                              ▲
        GitHub Actions: lint ➜ test ➜ build ➜ deploy bij elke push naar main
```

## Lokaal draaien

### Vereisten

- Node.js (LTS-versie)
- PostgreSQL (of Docker)

### Installatie

```bash
git clone https://github.com/<jouw-gebruikersnaam>/shift-tracker.git
cd shift-tracker
npm install
cp .env.example .env   # vul hier je eigen database-URL in
npm run dev
```

De app draait daarna op `http://localhost:3000`.

### Tests draaien

```bash
npm test
```

## Uitdagingen en keuzes

<!-- Vul dit gaandeweg aan. Dit is het deel dat je in een sollicitatiegesprek vertelt. -->

- **Diensten over middernacht:** _hoe heb je dit opgelost?_
- **Zomer- en wintertijd:** _wat ging er mis, en hoe heb je het getest?_
- **Toeslagregels:** _waarom heb je gekozen voor instelbare regels in plaats van vaste percentages?_

## Wat ik heb geleerd

<!-- TODO: een paar zinnen over wat je hebt geleerd tijdens het bouwen -->

## Licentie

MIT