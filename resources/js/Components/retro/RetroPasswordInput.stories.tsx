import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroPasswordInput } from './RetroPasswordInput';

const meta = {
  title: 'Retro/RetroPasswordInput',
  component: RetroPasswordInput,
  args: {
    label: 'Senha',
    placeholder: '••••••••',
  },
} satisfies Meta<typeof RetroPasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: 'senha123' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
