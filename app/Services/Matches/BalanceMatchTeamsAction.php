<?php

namespace App\Services\Matches;

use App\Enums\PhysicalCondition;
use Illuminate\Support\Collection;

class BalanceMatchTeamsAction
{
    private const CONDITION_WEIGHTS = [
        'otimo' => 1.0,
        'regular' => 0.85,
        'unknown' => 0.85,
        'ruim' => 0.65,
        'machucado' => 0.4,
    ];

    /**
     * @param  Collection<int, array{id: int, rating: int|null, physical_condition: string|null}>  $players
     * @return array{a: array<int, int>, b: array<int, int>, unassigned: array<int, int>}
     */
    public function execute(Collection $players, ?int $teamSize): array
    {
        $sorted = $players
            ->map(fn (array $player): array => [
                'id' => (int) $player['id'],
                'score' => $this->score($player['rating'] ?? null, $player['physical_condition'] ?? null),
            ])
            ->sortBy([
                ['score', 'desc'],
                ['id', 'asc'],
            ])
            ->values();

        $teams = ['a' => [], 'b' => []];
        $unassigned = [];

        foreach ($sorted as $index => $player) {
            $preferred = $index % 2 === 0 ? 'a' : 'b';
            $other = $preferred === 'a' ? 'b' : 'a';

            if ($teamSize === null || count($teams[$preferred]) < $teamSize) {
                $teams[$preferred][] = $player['id'];
            } elseif (count($teams[$other]) < $teamSize) {
                $teams[$other][] = $player['id'];
            } else {
                $unassigned[] = $player['id'];
            }
        }

        return [
            'a' => $teams['a'],
            'b' => $teams['b'],
            'unassigned' => $unassigned,
        ];
    }

    private function score(?int $rating, ?string $physicalCondition): float
    {
        $baseRating = $rating ?? 3;
        $condition = PhysicalCondition::normalize($physicalCondition)->value;
        $weight = self::CONDITION_WEIGHTS[$condition] ?? 0.85;

        return round($baseRating * $weight, 2);
    }
}
