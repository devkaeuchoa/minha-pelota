import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroPixelIcon } from './RetroPixelIcon';

const meta = {
  title: 'Retro/RetroPixelIcon',
  component: RetroPixelIcon,
  args: {
    name: 'groups',
  },
} satisfies Meta<typeof RetroPixelIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Groups: Story = {};

export const Large: Story = {
  args: { size: 64 },
};
