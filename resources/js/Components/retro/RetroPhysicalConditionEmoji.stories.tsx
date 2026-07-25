import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroPhysicalConditionEmoji } from './RetroPhysicalConditionEmoji';

const meta = {
  title: 'Retro/RetroPhysicalConditionEmoji',
  component: RetroPhysicalConditionEmoji,
  args: {
    emoji: '💪',
    ariaLabel: 'Ótimo',
  },
} satisfies Meta<typeof RetroPhysicalConditionEmoji>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Otimo: Story = {
  args: { emoji: '💪', ariaLabel: 'Ótimo' },
};

export const Regular: Story = {
  args: { emoji: '🙂', ariaLabel: 'Regular' },
};

export const Ruim: Story = {
  args: { emoji: '😓', ariaLabel: 'Ruim' },
};

export const Machucado: Story = {
  args: { emoji: '🤕', ariaLabel: 'Machucado' },
};

export const Unknown: Story = {
  args: { emoji: '❓', ariaLabel: 'Desconhecido' },
};
