<?php

use App\Http\Controllers\GroupController;
use App\Http\Controllers\GroupMatchController;
use App\Http\Controllers\GroupMatchGenerationController;
use App\Http\Controllers\GroupMatchAttendanceController;
use App\Http\Controllers\GroupMatchPaymentController;
use App\Http\Controllers\InviteController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\PlayerHomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MatchAttendancePublicController;
use App\Models\Group;
use App\Models\Player;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (! Auth::check()) {
        return redirect()->route('login');
    }

    /** @var \App\Models\Player $user */
    $user = Auth::user();
    $isPlatformAdmin = (bool) ($user->is_admin ?? false);

    if (! $isPlatformAdmin) {
        return redirect()->route('player.home');
    }

    return redirect()->route('admin.home');
})->name('home');


Route::middleware('auth')->group(function () {
    Route::get('/home/player', [PlayerHomeController::class, 'index'])->name('player.home');
    Route::get('/home/admin', function () {
        /** @var \App\Models\Player|null $user */
        $user = Auth::user();
        abort_unless($user, 401);
        abort_unless((bool) ($user->is_admin ?? false), 403);

        $ownedGroups = Group::query()
            ->where('owner_player_id', $user->id)
            ->get(['id']);

        $ownedGroupIds = $ownedGroups->pluck('id')->all();

        $lastMatch = \App\Models\Game::query()
            ->whereIn('group_id', $ownedGroupIds)
            ->where('scheduled_at', '<=', now())
            ->orderByDesc('scheduled_at')
            ->first();

        $nextMatch = \App\Models\Game::query()
            ->whereIn('group_id', $ownedGroupIds)
            ->where('scheduled_at', '>', now())
            ->orderBy('scheduled_at')
            ->first();

        $pastMatchesCount = \App\Models\Game::query()
            ->whereIn('group_id', $ownedGroupIds)
            ->where('scheduled_at', '<=', now())
            ->count();

        $upcomingMatchesCount = \App\Models\Game::query()
            ->whereIn('group_id', $ownedGroupIds)
            ->where('scheduled_at', '>', now())
            ->count();

        return Inertia::render('Home/Admin', [
            'ownerGroupsCount' => count($ownedGroupIds),
            'pastMatchesCount' => $pastMatchesCount,
            'upcomingMatchesCount' => $upcomingMatchesCount,
            'lastMatchDate' => $lastMatch?->scheduled_at?->toISOString(),
            'nextMatchDate' => $nextMatch?->scheduled_at?->toISOString(),
        ]);
    })->name('admin.home');
    Route::get('/home/player/groups/{group}', [PlayerHomeController::class, 'showGroup'])
        ->name('player.groups.show');
    Route::post('/home/player/matches/{match}/presence', [PlayerHomeController::class, 'updatePresence'])
        ->name('player.home.presence.update');
    Route::post('/home/player/groups/{group}/physical-condition', [PlayerHomeController::class, 'updatePhysicalCondition'])
        ->name('player.home.physical-condition.update');
    Route::delete('/api/player/groups/{group}/leave', [PlayerHomeController::class, 'leaveGroup'])
        ->name('api.player.groups.leave');

    Route::get('/groups', function () {
        /** @var \App\Models\Player|null $user */
        $user = Auth::user();
        abort_unless($user, 401);
        abort_unless((bool) ($user->is_admin ?? false), 403);

        $groups = Group::query()
            ->where('owner_player_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        $groupIds = $groups->pluck('id')->all();
        $lastFinishedMatch = \App\Models\Game::query()
            ->whereIn('group_id', $groupIds)
            ->where('status', 'finished')
            ->where('scheduled_at', '<=', now())
            ->orderByDesc('scheduled_at')
            ->first();

        return Inertia::render('Groups/Index', [
            'groups' => $groups->values()->all(),
            'lastFinishedMatchForPayments' => $lastFinishedMatch
                ? [
                    'group_id' => $lastFinishedMatch->group_id,
                    'match_id' => $lastFinishedMatch->id,
                    'scheduled_at' => $lastFinishedMatch->scheduled_at?->toISOString(),
                ]
                : null,
        ]);
    })->name('groups.index');

    Route::get('/dates', function (\Illuminate\Http\Request $request) {
        /** @var \App\Models\Player|null $user */
        $user = Auth::user();
        abort_unless($user, 401);
        abort_unless((bool) ($user->is_admin ?? false), 403);

        $groups = Group::query()
            ->where('owner_player_id', $user->id)
            ->orderBy('name')
            ->get()
            ->values();

        $selectedGroupId = (int) $request->integer('group');
        $selectedGroup = $groups->firstWhere('id', $selectedGroupId) ?? $groups->first();

        $matches = collect();
        if ($selectedGroup) {
            $matches = $selectedGroup->matches()
                ->orderBy('scheduled_at')
                ->get();
        }

        return Inertia::render('Groups/Dates', [
            'groups' => $groups->values()->all(),
            'selectedGroupId' => $selectedGroup?->id,
            'selectedGroup' => $selectedGroup,
            'matches' => $matches->values()->all(),
        ]);
    })->name('dates.index');

    Route::get('/groups/create', function () {
        abort_unless((bool) (Auth::user()?->is_admin ?? false), 403);
        return Inertia::render('Groups/Create');
    })->name('groups.create');

    Route::get('/groups/{group}', function (Group $group) {
        abort_unless((bool) (Auth::user()?->is_admin ?? false), 403);
        abort_unless($group->owner_player_id === Auth::id(), 403);

        $players = $group->players()
            ->with('stats')
            ->get()
            ->map(function (Player $player) {
                return [
                    'id' => $player->id,
                    'name' => $player->name,
                    'nick' => $player->nick,
                    'phone' => $player->phone,
                    'rating' => $player->rating,
                    'stats' => [
                        'goals' => (int) ($player->stats?->goals ?? 0),
                        'assists' => (int) ($player->stats?->assists ?? 0),
                        'games_played' => (int) ($player->stats?->games_played ?? 0),
                        'games_missed' => (int) ($player->stats?->games_missed ?? 0),
                    ],
                    'created_at' => $player->created_at?->toISOString(),
                    'updated_at' => $player->updated_at?->toISOString(),
                ];
            })
            ->values();
        $matches = $group->matches()
            ->orderBy('scheduled_at')
            ->get();

        return Inertia::render('Groups/Show', [
            'group' => $group,
            'players' => $players,
            'matches' => $matches,
        ]);
    })->name('groups.show');

    Route::get('/groups/{group}/edit', function (Group $group) {
        abort_unless((bool) (Auth::user()?->is_admin ?? false), 403);
        abort_unless($group->owner_player_id === Auth::id(), 403);

        return Inertia::render('Groups/Edit', [
            'group' => $group,
        ]);
    })->name('groups.edit');

    Route::get('/groups/{group}/players', function (Group $group) {
        abort_unless((bool) (Auth::user()?->is_admin ?? false), 403);
        abort_unless($group->owner_player_id === Auth::id(), 403);

        $groupPlayers = $group->players()
            ->with('stats')
            ->get()
            ->map(function (Player $player) {
                return [
                    'id' => $player->id,
                    'name' => $player->name,
                    'nick' => $player->nick,
                    'phone' => $player->phone,
                    'rating' => $player->rating,
                    'stats' => [
                        'goals' => (int) ($player->stats?->goals ?? 0),
                        'assists' => (int) ($player->stats?->assists ?? 0),
                        'games_played' => (int) ($player->stats?->games_played ?? 0),
                        'games_missed' => (int) ($player->stats?->games_missed ?? 0),
                    ],
                    'created_at' => $player->created_at?->toISOString(),
                    'updated_at' => $player->updated_at?->toISOString(),
                ];
            })
            ->values();
        $availablePlayers = Player::query()
            ->whereNotIn('id', $groupPlayers->pluck('id'))
            ->orderBy('name')
            ->with('stats')
            ->get()
            ->map(function (Player $player) {
                return [
                    'id' => $player->id,
                    'name' => $player->name,
                    'nick' => $player->nick,
                    'phone' => $player->phone,
                    'rating' => $player->rating,
                    'stats' => [
                        'goals' => (int) ($player->stats?->goals ?? 0),
                        'assists' => (int) ($player->stats?->assists ?? 0),
                        'games_played' => (int) ($player->stats?->games_played ?? 0),
                        'games_missed' => (int) ($player->stats?->games_missed ?? 0),
                    ],
                    'created_at' => $player->created_at?->toISOString(),
                    'updated_at' => $player->updated_at?->toISOString(),
                ];
            })
            ->values();

        return Inertia::render('Groups/Players', [
            'group' => $group,
            'groupPlayers' => $groupPlayers,
            'availablePlayers' => $availablePlayers,
        ]);
    })->name('groups.players');

    Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
    Route::put('/groups/{group}', [GroupController::class, 'update'])->name('groups.update');
    Route::delete('/groups/{group}', [GroupController::class, 'destroy'])->name('groups.destroy');
    Route::delete('/groups', [GroupController::class, 'destroyMany'])->name('groups.destroyMany');

    Route::post('/groups/{group}/invite', [GroupController::class, 'regenerateInvite'])->name('groups.invite.regenerate');

    Route::post('/groups/{group}/matches/generate/current-month', [
        GroupMatchGenerationController::class,
        'generateCurrentMonth',
    ])->name('groups.matches.generate-current-month');
    Route::post('/groups/{group}/matches/generate/months', [
        GroupMatchGenerationController::class,
        'generateForMonths',
    ])->name('groups.matches.generate-months');
    Route::post('/groups/{group}/matches', [GroupMatchController::class, 'store'])
        ->name('groups.matches.store');
    Route::put('/groups/{group}/matches/{match}', [GroupMatchController::class, 'update'])
        ->name('groups.matches.update');
    Route::delete('/groups/{group}/matches/{match}', [GroupMatchController::class, 'destroy'])
        ->name('groups.matches.destroy');

    Route::get('/groups/{group}/matches/{match}/attendance', [
        GroupMatchAttendanceController::class,
        'manage',
    ])->name('groups.matches.presence.manage');

    Route::post('/groups/{group}/matches/{match}/attendance/link', [
        GroupMatchAttendanceController::class,
        'generateLink',
    ])->name('groups.matches.presence.generate-link');
    Route::get('/groups/{group}/matches/{match}/payments', [
        GroupMatchPaymentController::class,
        'manage',
    ])->name('groups.matches.payments.manage');
    Route::post('/groups/{group}/matches/{match}/payments/sync', [
        GroupMatchPaymentController::class,
        'sync',
    ])->name('groups.matches.payments.sync');
    Route::patch('/groups/{group}/matches/{match}/payments/{player}', [
        GroupMatchPaymentController::class,
        'update',
    ])->name('groups.matches.payments.update');

    Route::post('/groups/{group}/players', [PlayerController::class, 'store'])->name('groups.players.store');
    Route::post('/groups/{group}/players/attach', [PlayerController::class, 'attachExisting'])->name('groups.players.attach');
    Route::put('/groups/{group}/players/{player}', [PlayerController::class, 'update'])->name('groups.players.update');
    Route::delete('/groups/{group}/players/{player}', [PlayerController::class, 'destroy'])->name('groups.players.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/retro/ui-kit', function () {
    return Inertia::render('Retro/UiKit');
})->name('retro.ui-kit');

Route::get('/invite/{inviteCode}', [InviteController::class, 'show'])->name('invite.show');
Route::post('/invite/{inviteCode}', [InviteController::class, 'store'])->name('invite.store');
Route::get('/invite/{inviteCode}/phone-availability', [InviteController::class, 'phoneAvailability'])
    ->name('invite.phone-availability');
Route::get('/invite/{inviteCode}/success', [InviteController::class, 'success'])->name('invite.success');

Route::get('/presence/{token}', [MatchAttendancePublicController::class, 'show'])->name('presence.show');
Route::post('/presence/{token}', [MatchAttendancePublicController::class, 'store'])->name('presence.store');

require __DIR__ . '/auth.php';
