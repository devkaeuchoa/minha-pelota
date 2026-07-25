import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroSelect } from './RetroSelect';

const options = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'avulso', label: 'Avulso' },
  { value: 'isento', label: 'Isento' },
];

const meta = {
  title: 'Retro/RetroSelect',
  component: RetroSelect,
  args: {
    label: 'Tipo de cobrança',
    options,
  },
} satisfies Meta<typeof RetroSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelectedValue: Story = {
  args: { defaultValue: 'avulso' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
