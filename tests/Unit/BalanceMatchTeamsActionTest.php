<?php

namespace Tests\Unit;

use App\Services\Matches\BalanceMatchTeamsAction;
use Illuminate\Support\Collection;
use PHPUnit\Framework\TestCase;

class BalanceMatchTeamsActionTest extends TestCase
{
    public function test_splits_even_pool_with_no_cap_evenly(): void
    {
        $players = collect([
            ['id' => 1, 'rating' => 5, 'physical_condition' => 'otimo'],
            ['id' => 2, 'rating' => 4, 'physical_condition' => 'otimo'],
            ['id' => 3, 'rating' => 3, 'physical_condition' => 'otimo'],
            ['id' => 4, 'rating' => 2, 'physical_condition' => 'otimo'],
        ]);

        $result = (new BalanceMatchTeamsAction)->execute($players, null);

        $this->assertCount(2, $result['a']);
        $this->assertCount(2, $result['b']);
        $this->assertCount(0, $result['unassigned']);
    }

    public function test_splits_odd_pool_giving_extra_to_team_a(): void
    {
        $players = collect([
            ['id' => 1, 'rating' => 5, 'physical_condition' => 'otimo'],
            ['id' => 2, 'rating' => 4, 'physical_condition' => 'otimo'],
            ['id' => 3, 'rating' => 3, 'physical_condition' => 'otimo'],
        ]);

        $result = (new BalanceMatchTeamsAction)->execute($players, null);

        $this->assertCount(2, $result['a']);
        $this->assertCount(1, $result['b']);
        $this->assertCount(0, $result['unassigned']);
    }

    public function test_caps_teams_at_team_size_and_overflows_to_unassigned(): void
    {
        $players = collect([
            ['id' => 1, 'rating' => 5, 'physical_condition' => 'otimo'],
            ['id' => 2, 'rating' => 4, 'physical_condition' => 'otimo'],
            ['id' => 3, 'rating' => 3, 'physical_condition' => 'otimo'],
            ['id' => 4, 'rating' => 2, 'physical_condition' => 'otimo'],
            ['id' => 5, 'rating' => 1, 'physical_condition' => 'otimo'],
        ]);

        $result = (new BalanceMatchTeamsAction)->execute($players, 2);

        $this->assertCount(2, $result['a']);
        $this->assertCount(2, $result['b']);
        $this->assertCount(1, $result['unassigned']);
    }

    public function test_null_rating_falls_back_to_midpoint(): void
    {
        $players = collect([
            ['id' => 1, 'rating' => null, 'physical_condition' => 'otimo'],
            ['id' => 2, 'rating' => 3, 'physical_condition' => 'otimo'],
        ]);

        $result = (new BalanceMatchTeamsAction)->execute($players, null);

        // Equal scores (both resolve to rating 3 * 1.0): tie-break by id asc, so id 1 -> team a, id 2 -> team b.
        $this->assertSame([1], $result['a']);
        $this->assertSame([2], $result['b']);
    }

    public function test_ordering_is_deterministic_via_id_tiebreak(): void
    {
        $players = collect([
            ['id' => 5, 'rating' => 3, 'physical_condition' => 'otimo'],
            ['id' => 2, 'rating' => 3, 'physical_condition' => 'otimo'],
            ['id' => 3, 'rating' => 3, 'physical_condition' => 'otimo'],
            ['id' => 1, 'rating' => 3, 'physical_condition' => 'otimo'],
        ]);

        $resultOne = (new BalanceMatchTeamsAction)->execute($players, null);
        $resultTwo = (new BalanceMatchTeamsAction)->execute($players->reverse()->values(), null);

        $this->assertSame($resultOne, $resultTwo);
        $this->assertSame([1, 3], $resultOne['a']);
        $this->assertSame([2, 5], $resultOne['b']);
    }

    public function test_physical_condition_weight_changes_allocation_order(): void
    {
        $players = collect([
            ['id' => 1, 'rating' => 5, 'physical_condition' => 'machucado'],
            ['id' => 2, 'rating' => 3, 'physical_condition' => 'otimo'],
        ]);

        $result = (new BalanceMatchTeamsAction)->execute($players, null);

        // 5 * 0.4 = 2.0 (machucado) < 3 * 1.0 = 3.0 (otimo), so player 2 ranks first -> team a.
        $this->assertSame([2], $result['a']);
        $this->assertSame([1], $result['b']);
    }

    public function test_returns_collection_input_unmodified(): void
    {
        $players = collect([
            ['id' => 1, 'rating' => 5, 'physical_condition' => 'otimo'],
        ]);

        (new BalanceMatchTeamsAction)->execute($players, null);

        $this->assertInstanceOf(Collection::class, $players);
        $this->assertCount(1, $players);
    }
}
