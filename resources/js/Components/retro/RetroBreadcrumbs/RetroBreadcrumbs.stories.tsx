import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroBreadcrumbs } from './RetroBreadcrumbs';

const meta = {
  title: 'Retro/RetroBreadcrumbs',
  component: RetroBreadcrumbs,
} satisfies Meta<typeof RetroBreadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeLevels: Story = {
  args: {
    items: [
      { label: 'HOME', href: '#' },
      { label: 'GRUPOS', href: '#' },
      { label: 'TIME DE QUINTA' },
    ],
  },
};

export const TwoLevels: Story = {
  args: {
    items: [{ label: 'HOME', href: '#' }, { label: 'GRUPOS' }],
  },
};

export const RootOnly: Story = {
  args: {
    items: [{ label: 'HOME' }],
  },
};

export const FourLevels: Story = {
  args: {
    items: [
      { label: 'HOME', href: '#' },
      { label: 'GRUPOS', href: '#' },
      { label: 'E2E GROUP', href: '#' },
      { label: 'DIVISÃO DE TIMES' },
    ],
  },
};
