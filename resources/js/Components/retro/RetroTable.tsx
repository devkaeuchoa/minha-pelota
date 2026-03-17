import { PropsWithChildren } from 'react';

export function RetroTable({ children }: PropsWithChildren) {
  return (
    <div className="table">
      <table className="w-full border-collapse text-left text-sm text-white">
        {children}
      </table>
    </div>
  );
}

export function RetroTableHeaderRow({ children }: PropsWithChildren) {
  return <tr className="bg-[#1e348c] text-[#ffd700]">{children}</tr>;
}

export function RetroTableHeaderCell({ children }: PropsWithChildren) {
  return (
    <th className="border border-[#4060c0] px-3 py-2">
      {children}
    </th>
  );
}

interface RetroTableRowProps extends PropsWithChildren {
  index?: number;
}

export function RetroTableRow({ index, children }: RetroTableRowProps) {
  const isStriped = typeof index === 'number' && index % 2 === 1;
  const base = 'bg-[#0b1340] hover:bg-[#2540a0]';
  const zebra = isStriped ? ' bg-opacity-90' : '';

  return <tr className={base + zebra}>{children}</tr>;
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

export function RetroTableCell({ variant = 'default', children , className }: RetroTableCellProps) {
  return (
    <td className={`border border-[#4060c0] px-3 py-2 ${cellVariantClasses[variant]} ${className}`}>
      {children}
    </td>
  );
}

