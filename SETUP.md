# SwimCoach — Setup-ohjeet

## 1. Asenna riippuvuudet
```bash
npm install
```

## 2. Luo Supabase-projekti
1. Mene https://supabase.com ja luo uusi projekti (EU-alue)
2. Kopioi Project URL ja anon key

## 3. Ympäristömuuttujat
```bash
cp .env.example .env.local
```
Täytä `.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=YOUR_ANON_KEY
OPENAI_API_KEY=YOUR_OPENAI_KEY
```

## 4. Aja tietokantamigraatio
Supabase-projektin SQL Editorissa aja:
`supabase/migrations/001_initial_schema.sql`

## 5. Generoi TypeScript-tyypit
```bash
npm run db:types
```

## 6. Käynnistä kehitysympäristö
```bash
npm start
# → skannaa QR-koodi Expo Go -sovelluksella
```

## 7. EAS Build (tuotanto)
```bash
npm install -g eas-cli
eas login
eas build --platform ios    # tai android
```

## TODO ennen ensimmäistä testausta
- [ ] Lisää Supabase URL + anon key .env.local-tiedostoon
- [ ] Aja 001_initial_schema.sql Supabasessa
- [ ] Korvaa koodissa olevat "CLUB_ID", "COACH_ID", "SWIMMER_ID" placeholderit
        → ne haetaan oikeasti useAuth + users-taulusta
- [ ] Luo ensimmäinen seura + valmentaja + uimari Supabasen Table Editorilla

## 9. AI Coach Copilot — Edge Function

Deployaa Copilot-funktio Supabaseen:

```bash
# Asenna Supabase CLI
npm install -g supabase

# Kirjaudu
supabase login

# Linkitä projekti
supabase link --project-ref YOUR_PROJECT_ID

# Aseta OpenAI API key Edge Functionin salaisuudeksi
supabase secrets set OPENAI_API_KEY=sk-...

# Deployaa funktio
supabase functions deploy copilot
```

Funktio on nyt käytettävissä osoitteessa:
`https://YOUR_PROJECT.supabase.co/functions/v1/copilot`

## 10. Tarkista toimivuus

Testaa Copilot suoraan:
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/copilot \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"question": "Kuka on uinut eniten tällä kaudella?", "club_id": "YOUR_CLUB_ID"}'
```
