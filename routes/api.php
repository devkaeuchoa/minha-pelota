<?php

use App\Http\Controllers\Api\GroupController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('groups', GroupController::class);
});

