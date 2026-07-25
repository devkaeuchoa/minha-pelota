import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroValueDisplay } from './RetroValueDisplay';

const meta = {
  title: 'Retro/RetroValueDisplay',
  component: RetroValueDisplay,
  args: {
    label: 'Total',
    value: 'R$ 120,00',
  },
} satisfies Meta<typeof RetroValueDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongValue: Story = {
  args: { label: 'Placar', value: '10 x 8' },
};

export const EmptyValue: Story = {
  args: { label: 'Pendente', value: '—' },
};
