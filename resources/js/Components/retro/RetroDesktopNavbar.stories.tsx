import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RetroDesktopNavbar } from './RetroDesktopNavbar';

const meta = {
  title: 'Retro/RetroDesktopNavbar',
  component: RetroDesktopNavbar,
  args: {
    title: 'MINHA PELOTA',
    versionLabel: 'VER 1.0',
    items: [
      { id: 'home', label: 'INÍCIO', onClick: fn() },
      {
        id: 'groups',
        label: 'GRUPOS',
        onClick: fn(),
        children: [
          { id: 'groups.list', label: 'LISTAR', onClick: fn() },
          { id: 'groups.new', label: 'NOVO', onClick: fn() },
        ],
      },
      { id: 'profile', label: 'PERFIL', onClick: fn() },
    ],
    activeId: 'home',
    onLogout: fn(),
  },
} satisfies Meta<typeof RetroDesktopNavbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ActiveChild: Story = {
  args: { activeId: 'groups.list' },
};

export const WithoutLogout: Story = {
  args: { onLogout: undefined },
};
