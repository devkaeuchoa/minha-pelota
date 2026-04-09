<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\MatchAttendance;
use App\Models\MatchPlayerStat;
use App\Models\PlayerStat;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user, 401);

        $player = $user;

        $monthStart = CarbonImmutable::now()->startOfMonth();
        $monthEnd = CarbonImmutable::now()->endOfMonth();

        $historicalStats = [
            'goals' => 0,
            'assists' => 0,
            'games_played' => 0,
            'games_missed' => 0,
        ];

        $monthStats = [
            'goals' => 0,
            'assists' => 0,
            'games_played' => 0,
            'games_missed' => 0,
        ];

        if ($player) {
            $stats = PlayerStat::syncForPlayer((int) $player->id);
            $historicalStats = [
                'goals' => (int) $stats->goals,
                'assists' => (int) $stats->assists,
                'games_played' => (int) $stats->games_played,
                'games_missed' => (int) $stats->games_missed,
            ];

            $monthEventStats = MatchPlayerStat::query()
                ->join('matches', 'matches.id', '=', 'match_player_stats.match_id')
                ->where('match_player_stats.player_id', $player->id)
                ->whereBetween('matches.scheduled_at', [$monthStart, $monthEnd])
                ->selectRaw('COALESCE(SUM(match_player_stats.goals), 0) as goals, COALESCE(SUM(match_player_stats.assists), 0) as assists')
                ->first();

            $monthStats['goals'] = (int) ($monthEventStats?->goals ?? 0);
            $monthStats['assists'] = (int) ($monthEventStats?->assists ?? 0);

            $monthStats['games_played'] = (int) MatchAttendance::query()
                ->join('matches', 'matches.id', '=', 'match_attendance.match_id')
                ->where('match_attendance.player_id', $player->id)
                ->where('match_attendance.status', 'going')
                ->whereBetween('matches.scheduled_at', [$monthStart, $monthEnd])
                ->count();

            $monthStats['games_missed'] = (int) MatchAttendance::query()
                ->join('matches', 'matches.id', '=', 'match_attendance.match_id')
                ->where('match_attendance.player_id', $player->id)
                ->where('match_attendance.status', 'not_going')
                ->whereBetween('matches.scheduled_at', [$monthStart, $monthEnd])
                ->count();
        }

        $groups = $user->groups()
            ->orderBy('groups.name')
            ->get()
            ->map(fn($group) => [
                'id' => $group->id,
                'name' => $group->name,
                'is_admin' => (bool) $group->pivot?->is_admin,
            ])
            ->values()
            ->all();

        return Inertia::render('Profile/Edit', [
            'status' => session('status'),
            'profileData' => [
                'name' => $user->name,
                'nickname' => $user->nick,
                'phone' => $user->phone,
            ],
            'groups' => $groups,
            'stats' => [
                'month' => $monthStats,
                'historical' => $historicalStats,
                'month_label' => $monthStart->translatedFormat('F/Y'),
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $payload = $request->validated();
        if (array_key_exists('nickname', $payload)) {
            $payload['nick'] = $payload['nickname'];
            unset($payload['nickname']);
        }

        $request->user()->fill($payload);
        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
