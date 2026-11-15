import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { Preview, ReactRenderer } from '@storybook/react-vite';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { darkTheme, lightTheme } from '../src/theme';

const preview: Preview = {
  decorators: [
    // Ajoute le sélecteur « clair / sombre » dans la barre d'outils et entoure
    // chaque story du ThemeProvider MUI + CssBaseline.
    withThemeFromJSXProvider<ReactRenderer>({
      themes: { clair: lightTheme, sombre: darkTheme },
      defaultTheme: 'clair',
      Provider: ThemeProvider,
      GlobalStyles: CssBaseline,
    }),
  ],
  parameters: {
    layout: 'padded',
    controls: {
      matchers: { date: /(Date|date|week|Week)$/ },
    },
    a11y: {
      // Les violations d'accessibilité (axe) sont signalées comme des erreurs.
      test: 'error',
    },
    backgrounds: { disable: true },
  },
};

export default preview;
