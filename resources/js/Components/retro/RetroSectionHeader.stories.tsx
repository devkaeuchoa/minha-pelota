import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroSectionHeader } from './RetroSectionHeader';

const meta = {
  title: 'Retro/RetroSectionHeader',
  component: RetroSectionHeader,
  args: {
    title: 'JOGADORES',
  },
} satisfies Meta<typeof RetroSectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongTitle: Story = {
  args: { title: 'HISTÓRICO DE PAGAMENTOS DO GRUPO' },
};
