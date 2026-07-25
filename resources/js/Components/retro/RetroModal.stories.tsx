import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RetroModal } from './RetroModal';

const meta = {
  title: 'Retro/RetroModal',
  component: RetroModal,
  args: {
    open: true,
    title: 'CONFIRMAR EXCLUSÃO',
    message: 'Tem certeza que deseja remover este jogador do grupo?',
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof RetroModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Danger: Story = {
  args: { confirmVariant: 'danger' },
};

export const Success: Story = {
  args: {
    title: 'CONFIRMAR PRESENÇA',
    message: 'Deseja confirmar presença no próximo jogo?',
    confirmVariant: 'success',
    confirmText: 'CONFIRMAR',
  },
};

export const FullWidth: Story = {
  args: { variant: 'full-width' },
};

export const Processing: Story = {
  args: { processing: true },
};
