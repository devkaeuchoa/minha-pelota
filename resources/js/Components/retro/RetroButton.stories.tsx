import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroButton } from './RetroButton';

const meta = {
  title: 'Retro/RetroButton',
  component: RetroButton,
  args: {
    children: 'CONFIRMAR',
    variant: 'success',
  },
} satisfies Meta<typeof RetroButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { variant: 'success' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'EXCLUIR' },
};

export const Neutral: Story = {
  args: { variant: 'neutral', children: 'CANCELAR' },
};

export const Small: Story = {
  args: { variant: 'success', size: 'sm', children: 'OK' },
};

export const Large: Story = {
  args: { variant: 'success', size: 'lg', children: 'CONTINUAR' },
};

export const Disabled: Story = {
  args: { variant: 'success', disabled: true, children: 'INDISPONÍVEL' },
};
