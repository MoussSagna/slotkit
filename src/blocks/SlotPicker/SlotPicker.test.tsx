import { ThemeProvider } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { enUS } from 'date-fns/locale';
import { type ComponentProps, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockViewport, resetViewport } from '../../test/setup';
import { lightTheme } from '../../theme';
import type { Slot } from '../../utils';
import { SlotPicker } from './SlotPicker';
import { createDemoSlots, DEMO_WEEK } from './SlotPicker.fixtures';

type Props = ComponentProps<typeof SlotPicker>;

const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute);
const slot = (id: string, start: Date, available = true): Slot => ({ id, start, available });

// Semaine du lundi 16 novembre 2026.
const slots: Slot[] = [
  slot('mon-9', at(16, 9)),
  slot('mon-10', at(16, 10), false),
  slot('mon-11', at(16, 11)),
  slot('wed-9', at(18, 9)),
  slot('wed-10', at(18, 10)),
  slot('wed-11', at(18, 11)),
  slot('next-mon-9', at(23, 9)),
];

function renderPicker(props: Partial<Props> = {}) {
  const onChange = vi.fn<Props['onChange']>();
  const result = render(
    <ThemeProvider theme={lightTheme}>
      <SlotPicker
        slots={slots}
        value={null}
        onChange={onChange}
        defaultWeek={DEMO_WEEK}
        layout="week"
        {...props}
      />
    </ThemeProvider>,
  );
  return { ...result, onChange, user: userEvent.setup() };
}

/** Version contrôlée, comme dans une vraie application. */
function ControlledPicker(props: Partial<Props>) {
  const [value, setValue] = useState<string | null>(props.value ?? null);
  return (
    <ThemeProvider theme={lightTheme}>
      <SlotPicker
        slots={slots}
        defaultWeek={DEMO_WEEK}
        layout="week"
        {...props}
        value={value}
        onChange={(next) => {
          setValue(next?.id ?? null);
          props.onChange?.(next);
        }}
      />
    </ThemeProvider>
  );
}

const radio = (name: RegExp) => screen.getByRole('radio', { name });

describe('SlotPicker — affichage', () => {
  it('affiche la semaine, les 7 jours et les créneaux avec un nom accessible complet', () => {
    renderPicker();
    expect(screen.getByRole('heading', { name: '16 – 22 nov. 2026' })).toBeInTheDocument();
    const group = screen.getByRole('radiogroup', { name: 'Créneaux disponibles' });
    expect(within(group).getAllByRole('group')).toHaveLength(7);
    expect(radio(/^lundi 16 novembre, de 09:00 à 09:30$/)).toBeEnabled();
    expect(screen.getAllByRole('radio')).toHaveLength(6);
  });

  it('respecte la durée des créneaux dans le nom accessible', () => {
    renderPicker({ slotDuration: 45 });
    expect(screen.getAllByRole('radio', { name: /de 09:00 à 09:45/ })).toHaveLength(2);
  });

  it('désactive et annonce les créneaux indisponibles', () => {
    renderPicker();
    expect(radio(/10:00 à 10:30, indisponible$/)).toBeDisabled();
  });

  it('marque le créneau sélectionné', () => {
    renderPicker({ value: 'wed-10' });
    expect(radio(/mercredi 18 novembre, de 10:00/)).toBeChecked();
    expect(radio(/mercredi 18 novembre, de 09:00/)).not.toBeChecked();
  });

  it('rend indisponibles les créneaux hors bornes', () => {
    renderPicker({ minDate: at(18, 10) });
    expect(radio(/lundi 16 novembre, de 09:00/)).toBeDisabled();
    expect(radio(/mercredi 18 novembre, de 09:00/)).toBeDisabled();
    expect(radio(/mercredi 18 novembre, de 10:00/)).toBeEnabled();
  });

  it('utilise la locale fournie', () => {
    renderPicker({ locale: enUS, labels: { slotAriaLabel: (start) => start.toISOString() } });
    // En anglais (US), la semaine commence le dimanche 15 novembre.
    expect(screen.getByRole('heading', { name: '15 – 21 Nov 2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio', { name: /T/ })[0]).toHaveTextContent('9:00 AM');
  });
});

describe('SlotPicker — sélection', () => {
  it('appelle onChange avec le créneau cliqué', async () => {
    const { user, onChange } = renderPicker();
    await user.click(radio(/mercredi 18 novembre, de 11:00/));
    expect(onChange).toHaveBeenCalledWith(slots[5]);
  });

  it('ne fait rien sur un créneau indisponible', async () => {
    const { onChange } = renderPicker();
    // user-event refuse de cliquer un élément désactivé : on désactive ce contrôle pour le vérifier.
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    await user.click(radio(/indisponible/));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignore un second clic sur la sélection, sauf avec allowDeselect', async () => {
    const first = renderPicker({ value: 'mon-9' });
    await first.user.click(radio(/lundi 16 novembre, de 09:00/));
    expect(first.onChange).not.toHaveBeenCalled();
    first.unmount();

    const second = renderPicker({ value: 'mon-9', allowDeselect: true });
    await second.user.click(radio(/lundi 16 novembre, de 09:00/));
    expect(second.onChange).toHaveBeenCalledWith(null);
  });
});

describe('SlotPicker — navigation entre semaines', () => {
  it('passe à la semaine suivante et prévient le parent', async () => {
    const onWeekChange = vi.fn();
    const { user } = renderPicker({ onWeekChange });
    await user.click(screen.getByRole('button', { name: 'Semaine suivante' }));
    expect(onWeekChange).toHaveBeenCalledWith(at(23, 0));
    expect(screen.getByRole('heading', { name: '23 – 29 nov. 2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(1);
  });

  it('en mode contrôlé, affiche la semaine reçue sans changer seule', async () => {
    const onWeekChange = vi.fn();
    const { user } = renderPicker({ week: at(18, 12), onWeekChange });
    await user.click(screen.getByRole('button', { name: 'Semaine suivante' }));
    expect(onWeekChange).toHaveBeenCalledWith(at(23, 0));
    expect(screen.getByRole('heading', { name: '16 – 22 nov. 2026' })).toBeInTheDocument();
  });

  it('bloque la navigation au-delà de minDate et maxDate', () => {
    renderPicker({ minDate: at(16, 0), maxDate: at(22, 23) });
    expect(screen.getByRole('button', { name: 'Semaine précédente' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Semaine suivante' })).toBeDisabled();
  });
});

describe('SlotPicker — états', () => {
  it('chargement : squelettes, annonce et aria-busy, sans créneaux', () => {
    renderPicker({ loading: true });
    expect(screen.getByRole('status')).toHaveTextContent('Chargement des créneaux…');
    expect(screen.getByTestId('slot-picker-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'true');
  });

  it('vide : message et accès à la semaine suivante', async () => {
    const { user } = renderPicker({ slots: [slot('later', at(23, 9))] });
    expect(screen.getByRole('status')).toHaveTextContent('Aucun créneau disponible cette semaine.');
    await user.click(screen.getByRole('button', { name: 'Voir la semaine suivante' }));
    expect(screen.getByRole('radio', { name: /lundi 23 novembre/ })).toBeInTheDocument();
  });

  it('erreur : alerte prioritaire sur le chargement, avec bouton Réessayer', async () => {
    const onRetry = vi.fn();
    const { user } = renderPicker({ error: true, loading: true, onRetry });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Impossible de charger les créneaux');
    expect(alert).toHaveTextContent('Vérifiez votre connexion puis réessayez.');
    expect(screen.queryByTestId('slot-picker-skeleton')).not.toBeInTheDocument();
    await user.click(within(alert).getByRole('button', { name: 'Réessayer' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('erreur : accepte un message personnalisé', () => {
    renderPicker({ error: 'Serveur indisponible' });
    expect(screen.getByRole('alert')).toHaveTextContent('Serveur indisponible');
  });
});

describe('SlotPicker — clavier', () => {
  it('un seul arrêt de tabulation : le créneau sélectionné', async () => {
    const { user } = renderPicker({ value: 'wed-10' });
    await user.tab(); // semaine précédente
    await user.tab(); // titre non focusable → semaine suivante
    await user.tab();
    expect(radio(/mercredi 18 novembre, de 10:00/)).toHaveFocus();
    const tabbable = screen.getAllByRole('radio').filter((el) => el.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
  });

  it('flèches, Début / Fin et sélection avec Entrée / Espace', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ControlledPicker onChange={onChange} />);
    radio(/lundi 16 novembre, de 09:00/).focus();

    await user.keyboard('{ArrowDown}'); // saute 10:00 (indisponible)
    expect(radio(/lundi 16 novembre, de 11:00/)).toHaveFocus();

    await user.keyboard('{ArrowRight}'); // mardi vide → mercredi, même hauteur
    expect(radio(/mercredi 18 novembre, de 11:00/)).toHaveFocus();

    await user.keyboard('{Home}');
    expect(radio(/mercredi 18 novembre, de 09:00/)).toHaveFocus();
    await user.keyboard('{End}');
    expect(radio(/mercredi 18 novembre, de 11:00/)).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(slots[5]);
    expect(radio(/mercredi 18 novembre, de 11:00/)).toBeChecked();

    await user.keyboard('{ArrowUp} ');
    expect(onChange).toHaveBeenLastCalledWith(slots[4]);
  });

  it('Page suiv. change de semaine et place le focus sur le premier créneau', async () => {
    const onWeekChange = vi.fn();
    const { user } = renderPicker({ onWeekChange });
    radio(/lundi 16 novembre, de 09:00/).focus();
    await user.keyboard('{PageDown}');
    expect(onWeekChange).toHaveBeenCalledWith(at(23, 0));
    expect(radio(/lundi 23 novembre, de 09:00/)).toHaveFocus();
  });

  it('Page préc. sans créneau place le focus sur le titre de la semaine', async () => {
    const { user } = renderPicker();
    radio(/lundi 16 novembre, de 09:00/).focus();
    await user.keyboard('{PageUp}');
    expect(screen.getByRole('heading', { name: '9 – 15 nov. 2026' })).toHaveFocus();
  });
});

describe('SlotPicker — mobile (un jour à la fois)', () => {
  afterEach(() => {
    resetViewport();
  });

  it('en layout auto sur petit écran, affiche des onglets de jours', () => {
    mockViewport('mobile');
    renderPicker({ layout: 'auto' });
    expect(screen.getByRole('tablist', { name: 'Jours de la semaine' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(7);
    // Jour par défaut : le premier avec un créneau réservable (lundi).
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('lun. 16 2 créneaux');
    expect(screen.getByRole('tab', { name: /^mar\. 17/ })).toHaveTextContent('Aucun');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('ouvre le jour du créneau sélectionné et change de jour au clic', async () => {
    const { user } = renderPicker({ layout: 'day', value: 'wed-9' });
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(/^mer\. 18/);
    await user.click(screen.getByRole('tab', { name: /^mar\. 17/ }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Aucun créneau');
  });

  it('← / → passent au jour voisin ayant des créneaux', async () => {
    const { user } = renderPicker({ layout: 'day' });
    radio(/lundi 16 novembre, de 11:00/).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(/^mer\. 18/);
    expect(radio(/mercredi 18 novembre, de 11:00/)).toHaveFocus();
  });
});

describe('SlotPicker — données de démo', () => {
  it('fonctionne avec un grand jeu de créneaux', () => {
    renderPicker({ slots: createDemoSlots() });
    expect(screen.getAllByRole('radio').length).toBeGreaterThan(40);
  });
});
