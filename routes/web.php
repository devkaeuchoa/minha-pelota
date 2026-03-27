<?php

use App\Http\Controllers\GroupController;
use App\Http\Controllers\GroupMatchController;
use App\Http\Controllers\GroupMatchGenerationController;
use App\Http\Controllers\GroupMatchAttendanceController;
use App\Http\Controllers\InviteController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\PlayerHomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MatchAttendancePublicController;
use App\Models\Group;
use App\Models\Player;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (! Auth::check()) {
        return redirect()->route('login');
    }

    /** @var \App\Models\User $user */
    $user = Auth::user();
    $isOwner = Group::query()->where('owner_id', $user->id)->exists();
    $isAdminInGroup = $user->groups()->wherePivot('is_admin', true)->exists();

    if (! $isOwner && ! $isAdminInGroup) {
        return redirect()->route('player.home');
    }

    return redirect()->route('groups.index');
})->name('home');

Route::get('/dashboard', function () {
    /** @var \App\Models\User|null $user */
    $user = Auth::user();
    abort_unless($user, 401);

    $isOwner = Group::query()->where('owner_id', $user->id)->exists();
    $isAdminInGroup = $user->groups()->wherePivot('is_admin', true)->exists();
    if (! $isOwner && ! $isAdminInGroup) {
        return redirect()->route('player.home');
    }

    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/home/player', [PlayerHomeController::class, 'index'])->name('player.home');
    Route::get('/home/player/groups/{group}', [PlayerHomeController::class, 'showGroup'])
        ->name('player.groups.show');
    Route::post('/home/player/matches/{match}/presence', [PlayerHomeController::class, 'updatePresence'])
        ->name('player.home.presence.update');
    Route::post('/home/player/groups/{group}/physical-condition', [PlayerHomeController::class, 'updatePhysicalCondition'])
        ->name('player.home.physical-condition.update');

    Route::get('/groups', function () {
        $groups = Group::query()
            ->where('owner_id', Auth::id())
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Groups/Index', [
            'groups' => $groups,
        ]);
    })->name('groups.index');

    Route::get('/dates', function (\Illuminate\Http\Request $request) {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        abort_unless($user, 401);

        $ownedGroups = Group::query()
            ->where('owner_id', $user->id)
            ->get();

        $adminGroups = $user->groups()
            ->wherePivot('is_admin', true)
            ->get();

        $groups = $ownedGroups
            ->merge($adminGroups)
            ->unique('id')
            ->sortBy('name')
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
        return Inertia::render('Groups/Create');
    })->name('groups.create');

    Route::get('/groups/{group}', function (Group $group) {
        abort_unless($group->owner_id === Auth::id(), 403);

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
        abort_unless($group->owner_id === Auth::id(), 403);

        return Inertia::render('Groups/Edit', [
            'group' => $group,
        ]);
    })->name('groups.edit');

    Route::get('/groups/{group}/players', function (Group $group) {
        abort_unless($group->owner_id === Auth::id(), 403);

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
            ->where('owner_id', Auth::id())
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
