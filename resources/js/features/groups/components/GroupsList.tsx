/* global route */
import { Link } from '@inertiajs/react';
import { Group } from '@/types';
import { formatTimeHHMM, getWeekdayLabel } from '@/utils/datetime';
import { resolveGroupPermissions, resolveGroupSettings } from '@/utils/groups';
import { RetroButton } from '@/Components/retro';
import { useLocale } from '@/hooks/useLocale';

interface GroupsListProps {
  groups: Group[];
  selectedIds: Set<number>;
  onToggleSelected: (id: number) => void;
}

export function GroupsList({ groups, selectedIds, onToggleSelected }: GroupsListProps) {
  const { t } = useLocale();

  return (
    <div data-component="groups-list" className="flex flex-col gap-3">
      {groups.map((group) => {
        const permissions = resolveGroupPermissions(group, true);
        const settings = resolveGroupSettings(group);
        const weekdayLabel = getWeekdayLabel(settings.default_weekday) ?? settings.default_weekday;
        const timeLabel = formatTimeHHMM(settings.default_time);

        return (
          <div
            key={group.id}
            className="flex flex-col gap-3 rounded border-2 border-[#4060c0] bg-[#0b1340] p-3"
          >
            <div className="flex items-start gap-2">
              {permissions.can_manage_group && (
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0"
                  checked={selectedIds.has(group.id)}
                  onChange={() => onToggleSelected(group.id)}
                  aria-label={`Selecionar ${group.name}`}
                />
              )}
              <span className="retro-text-shadow text-lg text-[#ffd700]">{group.name}</span>
            </div>

            <div className="retro-text-shadow text-sm text-[#a0b0ff]">
              {[weekdayLabel, timeLabel, group.location_name].filter(Boolean).join(' · ')}
            </div>

            <div className="flex gap-2">
              <Link href={route('groups.show', group)} className="flex-1">
                <RetroButton size="sm" type="button" variant="success">
                  {t('groups.view')}
                </RetroButton>
              </Link>
              {permissions.can_manage_group && (
                <Link href={route('groups.edit', group)} className="flex-1">
                  <RetroButton size="sm" type="button" variant="neutral">
                    {t('groups.config')}
                  </RetroButton>
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
