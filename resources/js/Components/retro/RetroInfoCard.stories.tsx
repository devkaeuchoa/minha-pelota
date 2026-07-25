import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroInfoCard } from './RetroInfoCard';

const meta = {
  title: 'Retro/RetroInfoCard',
  component: RetroInfoCard,
} satisfies Meta<typeof RetroInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <span>Próximo jogo: sábado às 16h</span>
        <span>Local: Quadra do Bairro</span>
      </>
    ),
  },
};

export const SingleLine: Story = {
  args: {
    children: <span>Sem pendências no momento.</span>,
  },
};
