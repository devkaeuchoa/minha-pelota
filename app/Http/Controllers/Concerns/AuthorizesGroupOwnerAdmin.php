<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Group;
use Illuminate\Http\Request;

trait AuthorizesGroupOwnerAdmin
{
    private function authorizeOwnerOrAdmin(Request $request, Group $group): void
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $isAdmin = (bool) ($user->is_admin ?? false);
        $isOwner = $group->owner_player_id === $user->id;

        abort_unless($isAdmin && $isOwner, 403, 'You are not allowed to access this group.');
    }
}
