import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroFileInput } from './RetroFileInput';

const meta = {
  title: 'Retro/RetroFileInput',
  component: RetroFileInput,
  args: {
    label: 'Comprovante',
    browseLabel: 'ESCOLHER ARQUIVO',
    emptyFileLabel: 'Nenhum arquivo selecionado',
  },
} satisfies Meta<typeof RetroFileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithFile: Story = {
  args: { fileName: 'comprovante-pagamento.pdf' },
};
