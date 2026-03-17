<?php

use App\Http\Controllers\GroupController;
use App\Http\Controllers\ProfileController;
use App\Models\Group;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('groups.index');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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
            $players = $group->players()
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'physical_condition' => $user->physical_condition,
                        'is_admin' => (bool) $user->pivot->is_admin,
                    ];
                });

            return Inertia::render('Groups/Show', [
                'group' => $group,
                'players' => $players,
            ]);
        })->name('groups.show');

        Route::get('/groups/{group}/edit', function (Group $group) {
            return Inertia::render('Groups/Edit', [
                'group' => $group,
            ]);
        })->name('groups.edit');

        Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
        Route::put('/groups/{group}', [GroupController::class, 'update'])->name('groups.update');
        Route::delete('/groups/{group}', [GroupController::class, 'destroy'])->name('groups.destroy');
        Route::delete('/groups', [GroupController::class, 'destroyMany'])->name('groups.destroyMany');
    });
} else {
    Route::middleware('auth')->group(function () {
        Route::get('/groups', function () {
            $groups = Group::query()
                ->where('owner_id', auth()->id())
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
            abort_unless($group->owner_id === auth()->id(), 403);

            $players = $group->players()
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'physical_condition' => $user->physical_condition,
                        'is_admin' => (bool) $user->pivot->is_admin,
                    ];
                });

            return Inertia::render('Groups/Show', [
                'group' => $group,
                'players' => $players,
            ]);
        })->name('groups.show');

        Route::get('/groups/{group}/edit', function (Group $group) {
            abort_unless($group->owner_id === auth()->id(), 403);

            return Inertia::render('Groups/Edit', [
                'group' => $group,
            ]);
        })->name('groups.edit');

        Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
        Route::put('/groups/{group}', [GroupController::class, 'update'])->name('groups.update');
        Route::delete('/groups/{group}', [GroupController::class, 'destroy'])->name('groups.destroy');
        Route::delete('/groups', [GroupController::class, 'destroyMany'])->name('groups.destroyMany');

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });
}

require __DIR__.'/auth.php';
