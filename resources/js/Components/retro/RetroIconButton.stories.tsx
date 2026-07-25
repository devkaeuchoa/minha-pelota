import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroIconButton } from './RetroIconButton';

const meta = {
  title: 'Retro/RetroIconButton',
  component: RetroIconButton,
  args: {
    icon: <span>▶</span>,
    'aria-label': 'Avançar',
  },
} satisfies Meta<typeof RetroIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Metal: Story = {
  args: { variant: 'metal' },
};

export const Flat: Story = {
  args: { flat: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
