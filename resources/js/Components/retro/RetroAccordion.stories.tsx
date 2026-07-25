import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroAccordion } from './RetroAccordion';

const meta = {
  title: 'Retro/RetroAccordion',
  component: RetroAccordion,
  args: {
    title: 'DETALHES DO JOGO',
    children: (
      <>
        <span>Data: 25/07/2026</span>
        <span>Local: Quadra Central</span>
      </>
    ),
  },
} satisfies Meta<typeof RetroAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenByDefault: Story = {
  args: { defaultOpen: true },
};

export const ClosedByDefault: Story = {
  args: { defaultOpen: false },
};
