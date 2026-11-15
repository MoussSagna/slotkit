# Slotkit

Blocs d'interface React prêts à l'emploi pour les applications de **réservation et de planning**,
construits sur [Material UI](https://mui.com/material-ui/) (paquets gratuits sous licence MIT
uniquement, aucune dépendance à MUI X Pro / Premium).

Chaque bloc est conçu pour être **copié dans votre projet** puis adapté : code TypeScript strict,
typé, documenté, stylé uniquement via le thème MUI, testé et accessible au clavier.

| Bloc                        | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| [`SlotPicker`](#slotpicker) | Sélecteur de créneaux sur une semaine (desktop et mobile) |

---

## Sommaire

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Scripts](#scripts)
- [Structure du projet](#structure-du-projet)
- [Thème](#thème)
- [SlotPicker](#slotpicker)
- [Ajouter un nouveau bloc](#ajouter-un-nouveau-bloc)
- [Choix techniques et limites](#choix-techniques-et-limites)

## Prérequis

- Node.js **22** (voir `.nvmrc` ; minimum 20.19, exigé par Vite 8)
- npm 10+

| Outil                         | Version      |
| ----------------------------- | ------------ |
| React                         | 19.3         |
| Material UI (`@mui/material`) | 9.5          |
| TypeScript                    | 6.0          |
| Vite                          | 8.3          |
| Storybook                     | 10.6         |
| date-fns                      | 4.4          |
| Vitest                        | 5.1          |
| ESLint / typescript-eslint    | 10.15 / 8.72 |

> **Pourquoi TypeScript 6.0 et pas 7 ?** TypeScript 7 (réécriture native) n'est pas encore pris en
> charge par `typescript-eslint`, qui exige `typescript < 6.1`. Le projet passera à TypeScript 7
> dès que l'outillage ESLint le supportera.

## Installation

### Explorer le kit

```bash
npm install
```

```bash
npm run storybook
```

Storybook s'ouvre sur <http://localhost:6006>. Le bouton « pinceau » de la barre d'outils bascule
entre les thèmes **clair** et **sombre** ; l'onglet **Accessibility** affiche l'audit axe de la story.

### Utiliser un bloc dans votre application

1. Installez les dépendances requises (ce sont les `peerDependencies` du kit) :

   ```bash
   npm install @mui/material @mui/icons-material @emotion/react @emotion/styled date-fns
   ```

2. Copiez dans votre projet :
   - `src/theme/` (ou intégrez les tokens à votre thème existant) ;
   - `src/utils/` (fonctions pures partagées par les blocs) ;
   - le dossier du bloc, par exemple `src/blocks/SlotPicker/` (les fichiers `*.stories.tsx`,
     `*.test.tsx` et `*.fixtures.ts` sont facultatifs).

3. Enveloppez votre application dans le thème :

   ```tsx
   import CssBaseline from '@mui/material/CssBaseline';
   import { ThemeProvider } from '@mui/material/styles';
   import { createSlotkitTheme } from './theme';

   const theme = createSlotkitTheme({ mode: 'light' });

   export function App() {
     return (
       <ThemeProvider theme={theme}>
         <CssBaseline />
         {/* … */}
       </ThemeProvider>
     );
   }
   ```

## Scripts

| Commande                  | Rôle                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| `npm run storybook`       | Storybook en développement (port 6006)                               |
| `npm run build-storybook` | Build statique de Storybook dans `storybook-static/`                 |
| `npm test`                | Tests Vitest (une passe) ; `npm run test:watch` en mode surveillance |
| `npm run typecheck`       | Vérification TypeScript                                              |
| `npm run lint`            | ESLint (règles typées strictes, hooks React, Storybook)              |
| `npm run format`          | Formatage Prettier ; `npm run format:check` pour vérifier seulement  |
| `npm run build`           | Build librairie (ESM + déclarations `.d.ts`) dans `dist/`            |
| `npm run check`           | Tout ce qui précède, à lancer avant chaque commit                    |

## Structure du projet

```
slotkit/
├── .storybook/
│   ├── main.ts                  # addons : docs, a11y, themes
│   └── preview.tsx              # ThemeProvider + CssBaseline, sélecteur clair / sombre
├── src/
│   ├── theme/
│   │   ├── tokens.ts            # SEUL fichier avec des valeurs brutes (couleurs, tailles…)
│   │   ├── createSlotkitTheme.ts  # tokens → thème MUI ; lightTheme, darkTheme
│   │   ├── theme.test.ts        # dont la vérification des contrastes WCAG AA
│   │   ├── Tokens.stories.tsx   # aperçu visuel des tokens
│   │   └── index.ts
│   ├── utils/                   # fonctions pures, sans React
│   │   ├── dates.ts             # semaines, bornes, formatage
│   │   ├── slots.ts             # type Slot, état d'un créneau, regroupement par jour
│   │   ├── sx.ts                # mergeSx : combine les styles d'un bloc et la prop sx
│   │   └── *.test.ts
│   ├── blocks/
│   │   └── SlotPicker/          # un dossier par bloc (voir « Ajouter un nouveau bloc »)
│   ├── test/setup.ts            # jest-dom, simulation de matchMedia (mockViewport)
│   └── index.ts                 # exports publics
└── eslint.config.js · tsconfig*.json · vite.config.ts · .prettierrc.json
```

## Thème

Les blocs ne contiennent **aucune couleur codée en dur** : ils lisent `theme.palette`,
`theme.spacing`, `theme.shape` et `theme.typography`. Une règle ESLint interdit d'ailleurs les
littéraux de couleur (`#…`, `rgb()`, `hsl()`) dans `src/blocks/`.

Toutes les valeurs brutes sont centralisées dans `src/theme/tokens.ts` :

| Token         | Contenu                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------- |
| `colors`      | Palette par mode (`light`, `dark`) : primary, secondary, error, success, background, text, divider |
| `spacingUnit` | Unité d'espacement (8 px) : `theme.spacing(1)`                                                     |
| `radius`      | Arrondis `sm`, `md` (= `theme.shape.borderRadius`), `lg`                                           |
| `typography`  | Police, taille de base, graisses                                                                   |
| `focusRing`   | Épaisseur et décalage de l'anneau de focus clavier                                                 |

### Personnaliser

```ts
import { createSlotkitTheme } from './theme';

const theme = createSlotkitTheme({
  mode: 'dark',
  // Surcharge partielle : le reste vient des tokens par défaut.
  tokens: {
    colors: { dark: { primary: { main: '#fbbf24', contrastText: '#0f172a' } } },
    radius: { md: 4 },
    typography: { fontFamily: '"Poppins", sans-serif' },
  },
  // Options MUI classiques, appliquées en dernier.
  themeOptions: { components: { MuiButton: { defaultProps: { disableElevation: true } } } },
});
```

Les tokens d'origine restent accessibles dans `sx` : `sx={(theme) => ({ borderRadius: theme.slotkit.radius.lg })}`.

Si vous changez les couleurs, lancez `npm test` : `theme.test.ts` vérifie que les contrastes texte / fond
restent conformes WCAG AA (≥ 4.5:1).

## SlotPicker

Sélecteur de créneaux sur une semaine. **Composant contrôlé, sans appel réseau** : le parent
fournit les créneaux, la sélection et, s'il le souhaite, la semaine affichée.

```tsx
import { useState } from 'react';
import { SlotPicker, type Slot } from './blocks/SlotPicker';

export function Booking({ slots }: { slots: Slot[] }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <SlotPicker
      slots={slots}
      value={value}
      onChange={(slot) => setValue(slot?.id ?? null)}
      slotDuration={30}
      minDate={new Date()}
    />
  );
}
```

### Charger les créneaux semaine par semaine

```tsx
const [week, setWeek] = useState(new Date());
const { data, isLoading, error, refetch } = useSlots(week); // votre logique de chargement

<SlotPicker
  slots={data ?? []}
  value={value}
  onChange={(slot) => setValue(slot?.id ?? null)}
  week={week}
  onWeekChange={setWeek}
  loading={isLoading}
  error={error ? 'Impossible de joindre le serveur.' : undefined}
  onRetry={refetch}
/>;
```

### Type `Slot`

```ts
interface Slot {
  id: string; // identifiant stable, utilisé par `value`
  start: Date; // début du créneau (heure locale)
  available?: boolean; // false : affiché grisé, non réservable (défaut : true)
}
```

### Props

| Prop            | Type                           | Défaut                                    | Description                                                                              |
| --------------- | ------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| `slots`         | `readonly Slot[]`              | —                                         | Créneaux (plusieurs semaines possibles ; seuls ceux de la semaine affichée sont rendus). |
| `value`         | `string \| null`               | —                                         | `id` du créneau sélectionné.                                                             |
| `onChange`      | `(slot: Slot \| null) => void` | —                                         | Créneau choisi ; `null` si l'on désélectionne avec `allowDeselect`.                      |
| `allowDeselect` | `boolean`                      | `false`                                   | Un second clic sur la sélection la retire.                                               |
| `slotDuration`  | `number` (minutes)             | `30`                                      | Durée d'un créneau (fin = début + durée), utilisée dans le libellé accessible.           |
| `minDate`       | `Date`                         | —                                         | Instant minimal (inclus) : créneaux antérieurs indisponibles, navigation bloquée avant.  |
| `maxDate`       | `Date`                         | —                                         | Instant maximal (inclus), même logique.                                                  |
| `locale`        | `Locale` (date-fns)            | `fr`                                      | Formats et premier jour de la semaine.                                                   |
| `week`          | `Date`                         | —                                         | Semaine affichée (mode contrôlé, avec `onWeekChange`).                                   |
| `defaultWeek`   | `Date`                         | sélection, sinon aujourd'hui ou `minDate` | Semaine initiale (mode non contrôlé).                                                    |
| `onWeekChange`  | `(weekStart: Date) => void`    | —                                         | Changement de semaine : le bon moment pour charger les créneaux.                         |
| `loading`       | `boolean`                      | `false`                                   | Affiche des squelettes.                                                                  |
| `error`         | `ReactNode`                    | —                                         | État d'erreur ; `true` affiche le message par défaut. Prioritaire sur `loading`.         |
| `onRetry`       | `() => void`                   | —                                         | Affiche un bouton « Réessayer » dans l'état d'erreur.                                    |
| `layout`        | `'auto' \| 'week' \| 'day'`    | `'auto'`                                  | `auto` : 7 colonnes sur desktop, un jour à la fois sous le breakpoint `sm`.              |
| `labels`        | `Partial<SlotPickerLabels>`    | français                                  | Tous les textes et libellés accessibles (voir `SlotPicker.labels.ts`).                   |
| `sx`            | `SxProps<Theme>`               | —                                         | Styles de la racine.                                                                     |

### États d'un créneau

Calculés par `getSlotState` (`src/utils/slots.ts`), par ordre de priorité :

1. hors de `minDate` / `maxDate`, ou date invalide → **indisponible** ;
2. `available: false` → **indisponible** (même si son `id` est dans `value`) ;
3. `id === value` → **sélectionné** ;
4. sinon → **disponible**.

### Accessibilité

- Les créneaux forment un `radiogroup` (une seule sélection) ; chaque créneau est un `radio`
  avec un nom complet (« lundi 16 novembre, de 10:00 à 10:30 »). Les indisponibles sont
  désactivés et annoncés comme tels.
- Le titre de la semaine est un `h2` en `aria-live="polite"` : le changement de semaine est annoncé.
- Chargement : `aria-busy` sur la région et une annonce `role="status"` ; erreur : `role="alert"`.
- Couleur jamais seule porteuse d'information : la sélection a une coche, l'indisponibilité est barrée.
- Focus visible via `:focus-visible`, défini une fois dans le thème pour tous les blocs.

| Touche                  | Action                                                                    |
| ----------------------- | ------------------------------------------------------------------------- |
| Tab                     | Entre dans la grille (un seul arrêt : la sélection ou le premier créneau) |
| ↑ / ↓                   | Créneau précédent / suivant du jour                                       |
| ← / →                   | Jour précédent / suivant (change d'onglet sur mobile)                     |
| Début / Fin             | Premier / dernier créneau du jour                                         |
| Page préc. / Page suiv. | Semaine précédente / suivante                                             |
| Espace / Entrée         | Sélectionne le créneau                                                    |

> La sélection ne suit pas le focus (activation manuelle) : parcourir les créneaux au clavier
> ne déclenche pas `onChange`, ce qui évite des appels inutiles côté parent.

## Ajouter un nouveau bloc

Chaque bloc suit le même modèle que `src/blocks/SlotPicker/` :

```
src/blocks/MonBloc/
├── MonBloc.tsx            # composant principal : orchestration, état, rendu
├── MonBloc.types.ts       # props et types publics, documentés en JSDoc
├── MonBloc.labels.ts      # textes par défaut (fr), surchargeables via la prop `labels`
├── components/            # sous-composants internes (non exportés)
├── MonBloc.fixtures.ts    # données de démo partagées par stories et tests
├── MonBloc.stories.tsx    # une story par état
├── MonBloc.test.tsx       # tests d'interaction (Testing Library)
└── index.ts               # exports publics du bloc
```

1. **Types d'abord** : écrivez `MonBloc.types.ts`. Chaque prop a une JSDoc (elle alimente l'onglet
   Docs de Storybook) et une valeur par défaut documentée.
2. **Logique pure dans `src/utils/`** si elle peut servir à d'autres blocs (dates, calculs),
   avec ses tests unitaires. La logique propre au bloc peut vivre dans un fichier à part du
   dossier du bloc (comme `slotNavigation.ts`), testé séparément.
3. **Composant contrôlé** : données et sélection par les props, aucun appel réseau, callbacks
   pour tout ce qui change.
4. **Style via le thème uniquement** : valeurs de `theme.palette` (`'primary.main'`, `'text.secondary'`…),
   `theme.spacing`, `theme.shape`. La racine accepte `sx`, fusionnée en dernier avec `mergeSx`.
   Pas de « system props » sur les composants MUI (supprimées dans MUI v9) : utilisez `sx`.
5. **Textes** : aucun texte en dur dans le JSX, tout passe par `labels`.
6. **Accessibilité** : rôles et noms ARIA, navigation clavier complète, focus visible ; le nom
   accessible d'un contrôle doit contenir son texte visible (WCAG 2.5.3).
7. **Stories** : par défaut, états (chargement, vide, erreur…), mobile, thème sombre
   (`globals: { theme: 'sombre' }`). Vérifiez l'onglet **Accessibility** : zéro violation.
8. **Tests** : rendez le bloc dans un `ThemeProvider`, interrogez le DOM par rôle et nom
   accessible (`getByRole('radio', { name: … })`), simulez le clavier avec `user-event`.
   Pour le responsive, `mockViewport('mobile')` depuis `src/test/setup.ts`.
9. **Exports** : `index.ts` du bloc, puis une ligne dans `src/index.ts`.
10. `npm run check` doit passer.

## Choix techniques et limites

- **Thème** : deux thèmes générés par `createSlotkitTheme` (`lightTheme`, `darkTheme`) plutôt
  que les variables CSS de MUI, pour rester simple à intégrer dans un thème existant.
- **Fuseaux horaires** : les `Date` sont interprétées dans le fuseau du navigateur. Pour un service
  dans un autre fuseau, convertissez les créneaux avant de les passer au composant
  (par exemple avec `@date-fns/tz`).
- **Langues écrites de droite à gauche** : non prises en charge pour l'instant (← / → ne sont pas inversées).
- **Build librairie** : `npm run build` produit un module ESM et ses `.d.ts` dans `dist/` ; React,
  MUI, Emotion et date-fns restent externes (`peerDependencies`).
