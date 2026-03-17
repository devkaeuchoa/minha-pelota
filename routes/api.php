<?php

use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\GroupPlayerController;
use Illuminate\Support\Facades\Route;

if (app()->environment('local')) {
    Route::apiResource('groups', GroupController::class)
        ->names('api.groups');

    Route::get('groups/{group}/players', [GroupPlayerController::class, 'index'])
        ->name('api.groups.players.index');
    Route::post('groups/{group}/players', [GroupPlayerController::class, 'store'])
        ->name('api.groups.players.store');
    Route::patch('groups/{group}/players/{user}', [GroupPlayerController::class, 'update'])
        ->name('api.groups.players.update');
    Route::delete('groups/{group}/players/{user}', [GroupPlayerController::class, 'destroy'])
        ->name('api.groups.players.destroy');
} else {
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('groups', GroupController::class)
            ->names('api.groups');

        Route::get('groups/{group}/players', [GroupPlayerController::class, 'index'])
            ->name('api.groups.players.index');
        Route::post('groups/{group}/players', [GroupPlayerController::class, 'store'])
            ->name('api.groups.players.store');
        Route::patch('groups/{group}/players/{user}', [GroupPlayerController::class, 'update'])
            ->name('api.groups.players.update');
        Route::delete('groups/{group}/players/{user}', [GroupPlayerController::class, 'destroy'])
            ->name('api.groups.players.destroy');
    });
}

