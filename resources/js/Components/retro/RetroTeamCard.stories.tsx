import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroTeamCard } from './RetroTeamCard';

const meta = {
  title: 'Retro/RetroTeamCard',
  component: RetroTeamCard,
  args: {
    teamName: 'TIME A',
    playerLabel: '7 jogadores',
  },
} satisfies Meta<typeof RetroTeamCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFormation: Story = {
  args: { formationLabel: 'Formação', formation: '3-2-1' },
};

export const CustomFlag: Story = {
  args: {
    teamName: 'TIME B',
    flag: (
      <div className="flex h-7 w-10 items-center justify-center border-2 border-[#a0b0ff] bg-[#0b1340] text-lg">
        🏳
      </div>
    ),
  },
};
