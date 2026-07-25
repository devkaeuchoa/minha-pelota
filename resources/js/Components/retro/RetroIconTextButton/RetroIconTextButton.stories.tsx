import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroIconTextButton } from './RetroIconTextButton';

const meta = {
  title: 'Retro/RetroIconTextButton',
  component: RetroIconTextButton,
  args: {
    icon: <span>🗑</span>,
    label: 'REMOVER',
  },
} satisfies Meta<typeof RetroIconTextButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  args: { variant: 'neutral', label: 'EDITAR', icon: <span>✎</span> },
};

export const Danger: Story = {
  args: { variant: 'danger', label: 'REMOVER', icon: <span>🗑</span> },
};

export const Disabled: Story = {
  args: { variant: 'danger', disabled: true },
};

export const AsLink: Story = {
  args: { href: '#', label: 'ABRIR', icon: <span>↗</span> },
};
