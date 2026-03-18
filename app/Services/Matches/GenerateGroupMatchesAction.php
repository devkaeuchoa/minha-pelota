<?php

namespace App\Services\Matches;

use App\Models\Game;
use App\Models\Group;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class GenerateGroupMatchesAction
{
    public function execute(Group $group, CarbonImmutable $from, CarbonImmutable $until): Collection
    {
        if ($group->recurrence === 'none') {
            return collect();
        }

        $created = collect();
        $timezone = config('app.timezone');

        $current = $this->alignToWeekday($from, (int) $group->weekday);

        while ($current->lessThanOrEqualTo($until)) {
            $dateTimeString = $current->toDateString().' '.$group->time;
            $scheduledAt = CarbonImmutable::createFromFormat('Y-m-d H:i', $dateTimeString, $timezone);

            if (! Game::where('group_id', $group->id)->where('scheduled_at', $scheduledAt)->exists()) {
                $created->push(
                    Game::create([
                        'group_id' => $group->id,
                        'scheduled_at' => $scheduledAt,
                        'status' => 'scheduled',
                        'location_name' => $group->location_name,
                        'duration_minutes' => $group->default_match_duration_minutes,
                    ])
                );
            }

            $current = $this->nextOccurrence($current, $group->recurrence);
        }

        return $created;
    }

    private function alignToWeekday(CarbonImmutable $from, int $weekday): CarbonImmutable
    {
        $current = $from->startOfDay();

        while ($current->dayOfWeek !== $weekday) {
            $current = $current->addDay();
        }

        return $current;
    }

    private function nextOccurrence(CarbonImmutable $current, ?string $recurrence): CarbonImmutable
    {
        return match ($recurrence) {
            'biweekly' => $current->addWeeks(2),
            'monthly' => $current->addMonthNoOverflow(),
            default => $current->addWeek(),
        };
    }
}

