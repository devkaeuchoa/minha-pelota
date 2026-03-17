import { Link } from '@inertiajs/react';
import {
  RetroButton,
  RetroInlineInfo,
  RetroStatusPill,
  RetroValueDisplay,
} from '@/Components/retro';

interface GroupsHeaderProps {
  processing: boolean;
  hasSelection: boolean;
  total: number;
  selectedCount: number;
}

export function GroupsHeader({
  processing,
  hasSelection,
  total,
  selectedCount,
}: GroupsHeaderProps) {
  const statusLabel = 'BATCH';
  const status = hasSelection ? 'on' : 'off';
  const totalLabel = total.toString();
  const selectedLabel = selectedCount.toString();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <RetroStatusPill status={status} label={statusLabel} />

        <div className="flex flex-wrap gap-3">
          <RetroValueDisplay label="GROUPS" value={totalLabel} />
          <RetroValueDisplay label="SELECTED" value={selectedLabel} />
        </div>
      </div>

      <RetroInlineInfo message="MANAGE YOUR GROUPS AND MATCHES." />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex flex-1 justify-end gap-3">
          <RetroButton
            type="submit"
            variant="danger"
            disabled={!hasSelection || processing}
          >
            REMOVE SELECTED
          </RetroButton>
          <Link href="/groups/create" className="flex-1">
            <RetroButton type="button" variant="success">
              NEW GROUP
            </RetroButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
