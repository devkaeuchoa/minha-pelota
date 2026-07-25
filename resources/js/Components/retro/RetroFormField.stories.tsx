import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroFormField } from './RetroFormField';
import { RetroTextInput } from './RetroTextInput';

const meta = {
  title: 'Retro/RetroFormField',
  component: RetroFormField,
  args: {
    label: 'Apelido',
    htmlFor: 'apelido',
  },
} satisfies Meta<typeof RetroFormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <RetroTextInput id="apelido" placeholder="Digite o apelido" />,
  },
};

export const WithoutHtmlFor: Story = {
  args: {
    htmlFor: undefined,
    children: <RetroTextInput placeholder="Sem vínculo de label" />,
  },
};
