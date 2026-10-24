# Mobile demo implementation

## Scope

One native Expo frontend, two separate role flows, one local dataset. No report API, login, upload service, remote AI, push service or cross-device synchronization. Online maps use the existing web map stack. These decisions supersede the backend-first scope in the older `docs/mobile/` research notes.

## Phases

Each phase has a separate conventional commit.

1. **Scaffold and map:** Expo Router, strict TypeScript, isolated MapLibre DOM renderer and CARTO styles.
2. **UI and themes:** web-aligned semantic colors, accessible controls and persistent dark/light selection.
3. **Domain:** categories, statuses, priorities, geometry, validation, duplicate groups, support counts and recent demo fixtures.
4. **Persistence:** serialized local gateway, validated AsyncStorage data, file references, shared query cache and failure tests.
5. **Roles and settings:** demo notice, role selection, guarded independent stacks/tabs, theme settings and switching roles.
6. **Resident reading:** map/list filtering, report previews, details, photos, history and own/watched reports.
7. **Reporting:** three-step wizard, camera/gallery normalization, GPS/manual locations, simulated descriptions, nearby reports and persistent draft.
8. **Resident actions:** deduplicated confirmations, observation, local inbox and read state.
9. **Official flow:** active/all/archive queues, date/category/status/priority filters, sorting, editor, reasons and report linking.
10. **Completion:** explicit reset and recovery, unused-photo cleanup, navigation safeguards, static checks and setup notes.

Code completion does not imply device acceptance. In particular, phase 1 supplies the map renderer but its WebGL/worker behavior must still be checked on the target phones.

## Flow

```text
Entry / demo notice / theme
├── Resident
│   ├── Map ↔ list → report details → confirm / watch
│   ├── New report: photos → location → description / similar reports → local save
│   ├── My reports: created / watched / resume draft
│   ├── Inbox → report details
│   └── Settings: theme / switch role / reset
└── Official
    ├── Active queue → report → edit status / priority / public comment / link
    ├── All reports → report
    ├── Archive → report
    └── Settings: theme / switch role / reset
```

Switching roles removes the previous role's navigation history but preserves data and the saved resident draft. An official does not receive resident confirmation/watch controls. Resident details do not expose the editor.

## Persistence rules

- One `resident:local` demo identity; role selection is not authentication.
- Reports, histories, notifications and draft metadata are saved as one document.
- A mutation publishes success only after persistence finishes.
- Writes are serialized; a rejected write does not poison subsequent operations.
- The wizard saves on field blur, step changes and photo/location changes. Explicit save waits for completion. Characters still being edited can be lost on forced termination before a save completes.
- Files are copied first, references committed second. Removing files follows removal of their references.
- Creating a report consumes the saved draft in the same metadata write.
- Pending actions block duplicate submit and accidental navigation away.
- Linking keeps individual histories/photos; support counts unique authors and confirming residents across the group.
- Only status changes on own/watched groups create inbox entries, matching the web demo.
- Reset replaces data for both roles and removes app-owned photos. It preserves theme selection.

## Manual acceptance

Run the main scenario from the README in both themes, then check:

- Android and iOS: map load, marker selection, pan/zoom, location changes, theme changes, background/foreground and attribution.
- Camera/gallery: allow, deny, cancel, HEIC/JPEG input, multiple photos, cover ordering and missing-file feedback.
- GPS: allow, deny, disabled services, timeout and a position outside Łódź. Demo locations always remain available.
- Draft: save, back, discard, resume, restart, switch role, follow a similar report and return.
- Submit: invalid fields, five-photo limit, nearby-report acknowledgement, rapid taps and consecutive reports.
- Official: filters/sorting, date boundaries, required rejection/link reasons, cyclic-link prevention, archived reports and unsaved edits.
- Resident: confirmation/withdrawal, author counting, linked counts, watching, inbox badge and read state.
- Reset: both role datasets, draft, photos and theme retention.
- UI: small phones, keyboard, larger system text, safe areas, long titles and both role × theme combinations.

The map needs internet and WebGL support. Its failure must leave the local lists, reports and demo location choices usable. The simplified Łódź geometry is a demo boundary, matching the web frontend.
