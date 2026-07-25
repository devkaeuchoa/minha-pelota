import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  RetroTable,
  RetroTableHeaderRow,
  RetroTableHeaderCell,
  RetroTableRow,
  RetroTableCell,
} from './RetroTable';

const meta = {
  title: 'Retro/RetroTable',
  component: RetroTable,
} satisfies Meta<typeof RetroTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const players = [
  { name: 'João', nick: 'Jotinha', condition: 'Ótimo' },
  { name: 'Pedro', nick: 'Pedrão', condition: 'Regular' },
  { name: 'Lucas', nick: '—', condition: 'Machucado' },
];

export const Default: Story = {
  render: () => (
    <RetroTable>
      <RetroTableHeaderRow>
        <RetroTableHeaderCell>Nome</RetroTableHeaderCell>
        <RetroTableHeaderCell>Apelido</RetroTableHeaderCell>
        <RetroTableHeaderCell>Condição</RetroTableHeaderCell>
      </RetroTableHeaderRow>
      {players.map((player, index) => (
        <RetroTableRow key={player.name} index={index}>
          <RetroTableCell variant="strong">{player.name}</RetroTableCell>
          <RetroTableCell variant="muted">{player.nick}</RetroTableCell>
          <RetroTableCell variant="soft">{player.condition}</RetroTableCell>
        </RetroTableRow>
      ))}
    </RetroTable>
  ),
};

export const CellVariants: Story = {
  render: () => (
    <RetroTable>
      <RetroTableRow>
        <RetroTableCell variant="default">default</RetroTableCell>
        <RetroTableCell variant="muted">muted</RetroTableCell>
        <RetroTableCell variant="strong">strong</RetroTableCell>
        <RetroTableCell variant="soft">soft</RetroTableCell>
      </RetroTableRow>
    </RetroTable>
  ),
};
