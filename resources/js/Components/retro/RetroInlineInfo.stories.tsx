import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroInlineInfo } from './RetroInlineInfo';

const meta = {
  title: 'Retro/RetroInlineInfo',
  component: RetroInlineInfo,
  args: {
    message: 'Confirme sua presença até sexta-feira.',
  },
} satisfies Meta<typeof RetroInlineInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomIcon: Story = {
  args: { icon: '⚠', message: 'Pagamento pendente para este jogo.' },
};
