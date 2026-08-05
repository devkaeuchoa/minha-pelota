import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetroThumbCard } from './RetroThumbCard';
import { RetroPixelIcon } from './RetroPixelIcon';
import { RetroValueDisplay } from './RetroValueDisplay';

const meta = {
  title: 'Retro/RetroThumbCard',
  component: RetroThumbCard,
} satisfies Meta<typeof RetroThumbCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPixelIcon: Story = {
  args: {
    children: (
      <>
        <RetroThumbCard.Title>GRUPOS QUE VOCÊ É DONO</RetroThumbCard.Title>
        <RetroThumbCard.Thumb>
          <RetroPixelIcon name="groups" size={28} />
        </RetroThumbCard.Thumb>
        <RetroThumbCard.Body>
          <RetroValueDisplay label="TOTAL" value="3" />
        </RetroThumbCard.Body>
      </>
    ),
  },
};

export const WithEmoji: Story = {
  args: {
    children: (
      <>
        <RetroThumbCard.Title>PERFIL</RetroThumbCard.Title>
        <RetroThumbCard.Thumb>
          <span className="text-3xl">👤</span>
        </RetroThumbCard.Thumb>
        <RetroThumbCard.Body>
          <RetroValueDisplay label="NOME" value="Jogador" />
        </RetroThumbCard.Body>
      </>
    ),
  },
};
