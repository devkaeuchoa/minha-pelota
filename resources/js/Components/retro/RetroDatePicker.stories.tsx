import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroDatePicker } from './RetroDatePicker';

const meta = {
  title: 'Retro/RetroDatePicker',
  component: RetroDatePicker,
  args: {
    label: 'Data do jogo',
    segments: [
      { id: 'day', value: '25' },
      { id: 'month', value: '07', active: true },
      { id: 'year', value: '2026' },
    ],
  },
} satisfies Meta<typeof RetroDatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoActiveSegment: Story = {
  args: {
    segments: [
      { id: 'day', value: '01' },
      { id: 'month', value: '01' },
      { id: 'year', value: '2026' },
    ],
  },
};
