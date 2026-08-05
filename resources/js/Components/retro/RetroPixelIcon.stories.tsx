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

export const Flag: Story = {
  args: { name: 'flag' },
};

export const Calendar: Story = {
  args: { name: 'calendar' },
};

export const ArrowBack: Story = {
  args: { name: 'arrow-back' },
};

export const ArrowForward: Story = {
  args: { name: 'arrow-forward' },
};

export const Large: Story = {
  args: { size: 'lg' },
};
