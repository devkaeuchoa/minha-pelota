<?php

use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\GroupPlayerController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('groups', GroupController::class);

    Route::get('groups/{group}/players', [GroupPlayerController::class, 'index'])
        ->name('groups.players.index');
    Route::post('groups/{group}/players', [GroupPlayerController::class, 'store'])
        ->name('groups.players.store');
    Route::patch('groups/{group}/players/{user}', [GroupPlayerController::class, 'update'])
        ->name('groups.players.update');
    Route::delete('groups/{group}/players/{user}', [GroupPlayerController::class, 'destroy'])
        ->name('groups.players.destroy');
});

