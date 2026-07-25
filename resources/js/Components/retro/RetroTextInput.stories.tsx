import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroTextInput } from './RetroTextInput';

const meta = {
  title: 'Retro/RetroTextInput',
  component: RetroTextInput,
  args: {
    label: 'Nome',
    placeholder: 'Digite aqui...',
  },
} satisfies Meta<typeof RetroTextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: { label: 'Nome', type: 'text', placeholder: 'Digite o nome' },
};

export const NumberWithSteppers: Story = {
  args: { label: 'Quantidade', type: 'number', defaultValue: 5 },
};

export const WithoutLabel: Story = {
  args: { label: undefined, placeholder: 'Sem rótulo' },
};

export const Disabled: Story = {
  args: { label: 'Nome', disabled: true, defaultValue: 'Indisponível' },
};

export const ReadOnly: Story = {
  args: { label: 'Nome', readOnly: true, defaultValue: 'Somente leitura' },
};

export const NumberDisabled: Story = {
  args: { label: 'Quantidade', type: 'number', disabled: true, defaultValue: 3 },
};
