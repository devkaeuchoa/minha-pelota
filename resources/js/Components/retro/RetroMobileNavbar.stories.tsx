import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RetroMobileNavbar } from './RetroMobileNavbar';

const meta = {
  title: 'Retro/RetroMobileNavbar',
  component: RetroMobileNavbar,
  args: {
    title: 'MINHA PELOTA',
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
    backAriaLabel: 'Voltar',
    openMenuAriaLabel: 'Abrir menu',
    closeMenuAriaLabel: 'Fechar menu',
    modeSelectLabel: 'MODO ADMIN',
    logoutLabel: 'SAIR',
    statusHint: 'PRONTO',
    aHintLabel: 'CONFIRMAR',
    bHintLabel: 'VOLTAR',
  },
} satisfies Meta<typeof RetroMobileNavbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ActiveChild: Story = {
  args: { activeId: 'groups.list' },
};
