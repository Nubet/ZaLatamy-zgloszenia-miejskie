# ZaŁatamy — mobile demo

Expo / React Native frontend for Android and iOS. Polish interface, separate resident and official flows, persistent light/dark themes.

## Run

From `mobile/`:

```bash
npm ci
npm start
```

Open the QR code with an Expo Go version supporting SDK 58. The terminal can also target an existing Android emulator with `a` or an iOS simulator on macOS with `i`. Native permission descriptions in `app.json` apply to a development/standalone build; Expo Go uses its own permission prompts.

No API server, environment variables or backend are required. Internet access is used for CARTO map styles, tiles, sprites and glyphs. Data does not sync with the web demo or another device. The complete app targets native platforms; the DOM map is an embedded web renderer, not a hosted copy of the web application.

## Demo

1. Select **Jestem mieszkańcem**.
2. Add a report using a demo illustration, a demo location and a manual or simulated description.
3. Open **Ustawienia → Zmień tryb** and select **Jestem urzędnikiem**.
4. Find the report under **Do obsługi**, open it and select **Aktualizuj sprawę**.
5. Change its status and add a public comment.
6. Switch back to the resident to see the report history and inbox update.

Both roles share one local dataset. A new app session starts at role selection; returning from the background keeps the current flow. Theme selection lives in **Ustawienia → Wygląd** and on the entry screen. Resetting demo data keeps the theme.

## Architecture

- `app/`: routing, role guards and composition.
- `src/domain/`: schemas and business rules, with no platform/UI imports.
- `src/application/`: gateway contracts, reporting services and shared query access.
- `src/infrastructure/`: AsyncStorage, private files, device access and demo fixtures.
- `src/features/`: resident and official screens, reporting, map and inbox.
- `src/shared/`: semantic theme tokens and native UI primitives.

Business rules originate from `frontend/src/domain/reports/`, adapted to mobile photo references. React Query wraps local asynchronous operations; it does not call HTTP. One serialized gateway persists reports, notifications and the resident draft together. Photos are normalized to JPEG and copied into the app document directory before their references are saved. Local storage is validated; corrupt data requires an explicit reset.

The map uses the same `maplibre-gl` 6.15 / `react-map-gl` 8.1 stack and CARTO light/dark styles as the web frontend, inside Expo DOM / WebView. It uses MapLibre's bundled worker rather than the Next.js-specific worker-copy script. Only serializable map data and native action callbacks cross that boundary. Navigation and reporting actions remain native.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
```

Tests cover domain rules, local write failures, linked reports, role-to-role state changes and queue filtering. See [IMPLEMENTATION.md](IMPLEMENTATION.md) for phase scope and manual checks.

Device interactions, map WebGL support, system permissions and final visual acceptance still need manual verification. No device or simulator was opened during implementation.
