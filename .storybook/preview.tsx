import type { Preview } from '@storybook/react-vite';
import { LocaleProvider } from '@/providers/LocaleProvider';
import '../resources/css/app.css';

const preview: Preview = {
  initialGlobals: {
    backgrounds: { value: 'retroDark' },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'retroDark',
      options: {
        retroDark: { name: 'Retro Dark', value: '#101c54' },
        retroDarker: { name: 'Retro Darker', value: '#0b1340' },
      },
    },
  },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
};

export default preview;
