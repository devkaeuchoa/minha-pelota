import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RetroPlayerList } from './RetroPlayerList';

const players = [
  { id: 1, name: 'João Silva', nick: 'Jotinha', presenceLabel: 'Confirmado' },
  { id: 2, name: 'Pedro Souza', nick: 'Pedrão', presenceLabel: 'Confirmado' },
  { id: 3, name: 'Lucas Lima', nick: null, presenceLabel: 'Pendente' },
];

const meta = {
  title: 'Retro/RetroPlayerList',
  component: RetroPlayerList,
  args: {
    title: 'JOGADORES DISPONÍVEIS',
    emptyLabel: 'Nenhum jogador disponível',
    players,
  },
} satisfies Meta<typeof RetroPlayerList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {
  args: { variant: 'available', selectedId: 1 },
};

export const Group: Story = {
  args: { variant: 'group', title: 'JOGADORES DO GRUPO', selectedIds: [1, 2] },
};

export const Empty: Story = {
  args: { players: [] },
};

export const Interactive: Story = {
  render: (args) => {
    function InteractivePlayerList() {
      const [selectedIds, setSelectedIds] = useState<number[]>([1]);
      return (
        <RetroPlayerList
          {...args}
          selectedIds={selectedIds}
          onToggle={(id) =>
            setSelectedIds((current) =>
              current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
            )
          }
        />
      );
    }
    return <InteractivePlayerList />;
  },
};
