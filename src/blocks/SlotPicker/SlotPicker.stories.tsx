import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { addDays, format, isSameWeek } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { fn } from 'storybook/test';
import { SlotPicker } from './SlotPicker';
import { createDemoSlots, DEMO_WEEK } from './SlotPicker.fixtures';
import type { Slot, SlotPickerProps } from './SlotPicker.types';

const demoSlots = createDemoSlots();

/**
 * Enveloppe contrôlée : garde la sélection dans un état local, comme le ferait
 * une application, et affiche le créneau choisi sous le composant.
 */
function ControlledSlotPicker(props: SlotPickerProps) {
  const [value, setValue] = useState(props.value);
  const selected = props.slots.find((slot) => slot.id === value);
  return (
    <Stack spacing={2}>
      <SlotPicker
        {...props}
        value={value}
        onChange={(slot) => {
          setValue(slot?.id ?? null);
          props.onChange(slot);
        }}
      />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Sélection :{' '}
        {selected ? format(selected.start, "EEEE d MMMM 'à' HH:mm", { locale: fr }) : 'aucune'}
      </Typography>
    </Stack>
  );
}

const meta = {
  title: 'Blocs/SlotPicker',
  component: SlotPicker,
  render: (args) => <ControlledSlotPicker {...args} />,
  args: {
    slots: demoSlots,
    value: null,
    defaultWeek: DEMO_WEEK,
    slotDuration: 30,
    loading: false,
    layout: 'auto',
    onChange: fn(),
    onWeekChange: fn(),
    onRetry: fn(),
  },
  argTypes: {
    slots: { control: false },
    locale: { control: false },
    labels: { control: false },
    error: { control: 'text' },
    layout: { control: 'inline-radio', options: ['auto', 'week', 'day'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Sélecteur de créneaux sur une semaine. Composant contrôlé, sans appel réseau : les créneaux arrivent par `slots`, la sélection par `value` / `onChange`. Clavier : ↑ ↓ créneau, ← → jour, Début / Fin, Page préc. / suiv. pour la semaine, Espace ou Entrée pour sélectionner.',
      },
    },
  },
} satisfies Meta<typeof SlotPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Semaine de démonstration avec des créneaux disponibles et indisponibles. */
export const ParDefaut: Story = { name: 'Par défaut' };

/** Un créneau déjà sélectionné ; un second clic le désélectionne grâce à `allowDeselect`. */
export const AvecSelection: Story = {
  name: 'Avec sélection',
  args: {
    value: demoSlots.find((slot) => slot.available !== false)?.id ?? null,
    allowDeselect: true,
  },
};

/** Squelettes affichés pendant le chargement (`loading`). */
export const Chargement: Story = { args: { loading: true } };

/** Aucune donnée pour la semaine : le composant propose la semaine suivante. */
export const Vide: Story = {
  args: { slots: demoSlots.filter((slot) => !isSameWeek(slot.start, DEMO_WEEK, { locale: fr })) },
};

/** État d'erreur avec bouton « Réessayer » (`error` + `onRetry`). */
export const Erreur: Story = { args: { error: true } };

/** Un jour à la fois, avec des onglets de jours. En layout `auto`, ce mode s'active sous le breakpoint `sm`. */
export const Mobile: Story = {
  args: { layout: 'day' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};

/** Thème sombre (sélectionnable aussi depuis la barre d'outils). */
export const ThemeSombre: Story = {
  name: 'Thème sombre',
  globals: { theme: 'sombre' },
};

/** Bornes : rien avant le mardi 17 novembre à midi, rien après le 4 décembre. */
export const AvecBornes: Story = {
  name: 'Avec dates min / max',
  args: { minDate: new Date(2026, 10, 17, 12), maxDate: new Date(2026, 11, 4, 23, 59) },
};

/** Locale anglaise (semaine commençant le dimanche, heures AM/PM) et textes traduits. */
export const EnAnglais: Story = {
  name: 'En anglais',
  args: {
    locale: enUS,
    labels: {
      groupLabel: 'Available time slots',
      previousWeek: 'Previous week',
      nextWeek: 'Next week',
      unavailable: 'unavailable',
      noSlotsForDay: 'No slots',
      dayTabsLabel: 'Days of the week',
      slotAriaLabel: (start, end, locale) =>
        `${format(start, 'EEEE, MMMM d', { locale })}, ${format(start, 'p', { locale })} to ${format(end, 'p', { locale })}`,
    },
  },
};

/**
 * Cas réel : le parent charge les créneaux de chaque semaine à la demande
 * (`week` + `onWeekChange`), avec un faux délai réseau.
 */
export const ChargementParSemaine: Story = {
  name: 'Chargement par semaine',
  render: function Render(args) {
    const [week, setWeek] = useState(DEMO_WEEK);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);
    const [value, setValue] = useState<string | null>(null);

    useEffect(() => {
      setLoading(true);
      const timer = setTimeout(() => {
        setSlots(demoSlots.filter((slot) => slot.start >= week && slot.start < addDays(week, 7)));
        setLoading(false);
      }, 800);
      return () => {
        clearTimeout(timer);
      };
    }, [week]);

    return (
      <SlotPicker
        {...args}
        slots={slots}
        loading={loading}
        value={value}
        week={week}
        onWeekChange={(next) => {
          setWeek(next);
          args.onWeekChange?.(next);
        }}
        onChange={(slot) => {
          setValue(slot?.id ?? null);
          args.onChange(slot);
        }}
      />
    );
  },
};
