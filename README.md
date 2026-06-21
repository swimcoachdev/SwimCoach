# SwimCoach

Uimavalmentajan työkalu harjoitusten, kilpailutulosten ja uimareiden kehityksen seurantaan. Rakennettu Expo + React Native + Supabase -stackilla.

## Tech stack

- **Expo SDK 56** + Expo Router (file-based routing)
- **React Native** + StyleSheet (ei NativeWind-riippuvuuksia)
- **Supabase** — PostgreSQL, Auth, Row Level Security
- **TypeScript**

## Rakenne

```
app/
  auth/          # Kirjautuminen
  coach/         # Valmentajan näkymät
    index.tsx        # Ryhmä-dashboard (FIFA-tyyli kortit)
    swimmers/        # Uimarilistaus + yksittäisen uimarin detail
    workout/         # Harjoitusten luonti & tarkastelu
    competitions/    # Kilpailut & tulokset
    copilot.tsx      # AI-kopilotti (Supabase-pohjainen, ei API-avainta)
  onboarding/    # Uuden uimarin lähtötaso + tavoitteet
  swimmer/       # Uimarin omat näkymät

components/
  swimmer/       # SwimmerCard (FIFA-tyylinen kortti)
  charts/        # GoalProgress, ZoneDistribution, WeeklyVolumeChart, TimeProgressionChart
  workout/       # ZoneBadge
  onboarding/    # StepIndicator

lib/
  ai/copilot.ts  # Rule-based copilotti — kyselee Supabasesta suoraan
  queries/       # Supabase-kyselyfunktiot
  utils/         # Aikamuunnokset, apufunktiot

supabase/        # SQL-migraatiot ja demo-data
```

## Supabase-skeemat (tärkeimmät)

- `swimmers` — uimarit, ryhmä, käyttäjätunnus
- `yearly_goals` — kausikohtaiset tavoitteet (km, harjoitukset, tehoalueet, kisatavoite)
- `workouts` + `workout_attendance` + `pool_sets` — harjoitusdatan kirjaus
- `competition_results` + `personal_records` — kilpailutulokset ja PR:t
- `swimmer_season_summary` VIEW — koostaa kauden statistiikat yhdeksi riviksi per uimari

## Käynnistys

```bash
npm install
npx expo start
```

Tarvitset `.env`-tiedoston Supabase-tunnuksilla:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_KEY=...
```

## Ominaisuudet

- **Ryhmä-dashboard** — FIFA-tyylinen korttiruudukko, josta näkee yhdellä silmäyksellä kaikkien uimareiden tilanteen (tavoite%, tehoalueet, riskit)
- **Uimarin detail** — vuositavoitteet, tehoaluejakauma vs. tavoite, PR:t, kilpailukehitys
- **Harjoituksen kirjaus** — uintisarjat tehoalueilla, kuivaharjoittelu
- **Kilpailutulokset** — automaattinen PR-päivitys
- **AI-kopilotti** — vastaa suomenkielisiin kysymyksiin ("kuka on eniten uinut?", "kenellä on riskissä tavoite?") ilman ulkoisia API-avaimia
- **Onboarding** — lähtötaso, volyymitavoite, tehoaluejakauma, kisatavoite
