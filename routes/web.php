<?php

use App\Http\Controllers\GroupController;
use App\Http\Controllers\GroupMatchGenerationController;
use App\Http\Controllers\GroupMatchAttendanceController;
use App\Http\Controllers\InviteController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\PlayerHomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MatchAttendancePublicController;
use App\Models\Group;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('groups.index');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/home/player', [PlayerHomeController::class, 'index'])->name('player.home');
    Route::post('/home/player/matches/{match}/confirm-presence', [PlayerHomeController::class, 'confirmPresence'])
        ->name('player.home.presence.confirm');
});

if (app()->environment('local')) {
    Route::group([], function () {
        Route::get('/groups', function () {
            $groups = Group::query()
                ->orderByDesc('created_at')
                ->get();

            return Inertia::render('Groups/Index', [
                'groups' => $groups,
            ]);
        })->name('groups.index');

        Route::get('/groups/create', function () {
            return Inertia::render('Groups/Create');
        })->name('groups.create');

        Route::get('/groups/{group}', function (Group $group) {
            $players = $group->players()->get();
            $upcomingMatches = $group->matches()->upcoming()->limit(10)->get();

            return Inertia::render('Groups/Show', [
                'group' => $group,
                'players' => $players,
                'matches' => $upcomingMatches,
            ]);
        })->name('groups.show');

        Route::get('/groups/{group}/edit', function (Group $group) {
            return Inertia::render('Groups/Edit', [
                'group' => $group,
            ]);
        })->name('groups.edit');

        Route::get('/groups/{group}/players', function (Group $group) {
            $groupPlayers = $group->players()->get();
            $availablePlayers = \App\Models\Player::query()
                ->whereNotIn('id', $groupPlayers->pluck('id'))
                ->orderBy('name')
                ->get();

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
    });
} else {
    Route::middleware('auth')->group(function () {
        Route::get('/groups', function () {
            $groups = Group::query()
                ->where('owner_id', Auth::id())
                ->orderByDesc('created_at')
                ->get();

            return Inertia::render('Groups/Index', [
                'groups' => $groups,
            ]);
        })->name('groups.index');

        Route::get('/groups/create', function () {
            return Inertia::render('Groups/Create');
        })->name('groups.create');

        Route::get('/groups/{group}', function (Group $group) {
            abort_unless($group->owner_id === Auth::id(), 403);

            $players = $group->players()->get();
            $upcomingMatches = $group->matches()->upcoming()->limit(10)->get();

            return Inertia::render('Groups/Show', [
                'group' => $group,
                'players' => $players,
                'matches' => $upcomingMatches,
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

            $groupPlayers = $group->players()->get();
            $availablePlayers = \App\Models\Player::query()
                ->where('owner_id', Auth::id())
                ->whereNotIn('id', $groupPlayers->pluck('id'))
                ->orderBy('name')
                ->get();

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
}

Route::get('/retro/ui-kit', function () {
    return Inertia::render('Retro/UiKit');
})->name('retro.ui-kit');

Route::get('/invite/{inviteCode}', [InviteController::class, 'show'])->name('invite.show');
Route::post('/invite/{inviteCode}', [InviteController::class, 'store'])->name('invite.store');
Route::get('/invite/{inviteCode}/success', [InviteController::class, 'success'])->name('invite.success');

Route::get('/presence/{token}', [MatchAttendancePublicController::class, 'show'])->name('presence.show');
Route::post('/presence/{token}', [MatchAttendancePublicController::class, 'store'])->name('presence.store');

require __DIR__ . '/auth.php';
