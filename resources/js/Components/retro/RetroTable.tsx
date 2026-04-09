import { PropsWithChildren } from 'react';

export function RetroTable({ children }: PropsWithChildren) {
  return (
    <div data-component="retro-table" className="table w-full h-full">
      <table className="w-full border-collapse text-left text-sm text-white">{children}</table>
    </div>
  );
}

export function RetroTableHeaderRow({ children }: PropsWithChildren) {
  return (
    <tr data-component="retro-table-header-row" className="bg-[#1e348c] text-[#ffd700]">
      {children}
    </tr>
  );
}

export function RetroTableHeaderCell({ children }: PropsWithChildren) {
  return (
    <th data-component="retro-table-header-cell" className="border border-[#4060c0] px-3 py-2">
      {children}
    </th>
  );
}

interface RetroTableRowProps extends PropsWithChildren {
  index?: number;
  className?: string;
}

export function RetroTableRow({ index, className = '', children }: RetroTableRowProps) {
  const isStriped = typeof index === 'number' && index % 2 === 1;
  const base = 'bg-[#0b1340] hover:bg-[#2540a0]';
  const zebra = isStriped ? ' bg-opacity-90' : '';

  return (
    <tr data-component="retro-table-row" className={`${base}${zebra} ${className}`}>
      {children}
    </tr>
  );
}

type CellVariant = 'default' | 'muted' | 'strong' | 'soft';

interface RetroTableCellProps extends PropsWithChildren {
  variant?: CellVariant;
  className?: string;
}

const cellVariantClasses: Record<CellVariant, string> = {
  default: 'text-white',
  muted: 'text-[#a0b0ff]',
  strong: 'font-semibold text-white',
  soft: 'text-[#cbd5f5]',
};

export function RetroTableCell({ variant = 'default', children, className }: RetroTableCellProps) {
  return (
    <td
      data-component="retro-table-cell"
      className={`h-full min-h-0 border border-[#4060c0] px-3 py-2 ${cellVariantClasses[variant]} ${className}`}
    >
      {children}
    </td>
  );
}
