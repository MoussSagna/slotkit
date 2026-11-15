import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { Meta, StoryObj } from '@storybook/react-vite';

/** Aperçu des tokens du thème actif (utilisez le sélecteur clair / sombre de la barre d'outils). */
function TokensPreview() {
  const theme = useTheme();
  const swatches = [
    ['primary.main', theme.palette.primary.main, theme.palette.primary.contrastText],
    ['secondary.main', theme.palette.secondary.main, theme.palette.secondary.contrastText],
    ['error.main', theme.palette.error.main, theme.palette.error.contrastText],
    ['success.main', theme.palette.success.main, theme.palette.success.contrastText],
    ['background.paper', theme.palette.background.paper, theme.palette.text.primary],
    ['background.default', theme.palette.background.default, theme.palette.text.primary],
  ] as const;

  return (
    <Stack spacing={4}>
      <section>
        <Typography variant="h6" component="h2" gutterBottom>
          Couleurs ({theme.palette.mode === 'dark' ? 'sombre' : 'clair'})
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          }}
        >
          {swatches.map(([name, bg, fg]) => (
            <Paper
              key={name}
              variant="outlined"
              sx={{ p: 2, bgcolor: bg, color: fg, borderColor: 'divider' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
                {name}
              </Typography>
              <Typography variant="caption">{bg}</Typography>
            </Paper>
          ))}
        </Box>
      </section>
      <section>
        <Typography variant="h6" component="h2" gutterBottom>
          Arrondis
        </Typography>
        <Stack direction="row" spacing={2}>
          {Object.entries(theme.slotkit.radius).map(([name, radius]) => (
            <Box
              key={name}
              sx={{
                width: 96,
                height: 64,
                border: 1,
                borderColor: 'primary.main',
                borderRadius: `${radius}px`,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Typography variant="caption">
                {name} · {radius}px
              </Typography>
            </Box>
          ))}
        </Stack>
      </section>
      <section>
        <Typography variant="h6" component="h2" gutterBottom>
          Espacements (unité {theme.slotkit.spacingUnit}px)
        </Typography>
        <Stack spacing={1}>
          {[1, 2, 3, 4].map((n) => (
            <Stack key={n} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography variant="caption" sx={{ width: 80 }}>
                spacing({n})
              </Typography>
              <Box
                sx={{
                  height: 12,
                  width: theme.spacing(n),
                  bgcolor: 'primary.main',
                  borderRadius: 0.5,
                }}
              />
            </Stack>
          ))}
        </Stack>
      </section>
    </Stack>
  );
}

const meta = {
  title: 'Thème/Tokens',
  component: TokensPreview,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof TokensPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Apercu: Story = { name: 'Aperçu' };
