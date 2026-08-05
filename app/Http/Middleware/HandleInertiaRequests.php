<?php

namespace App\Http\Middleware;

use App\Models\Group;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $canAccessPlayerAdminArea = false;
        $singleOwnedGroupId = null;

        if ($user !== null) {
            $canAccessPlayerAdminArea = (bool) ($user->is_admin ?? false);

            if ($canAccessPlayerAdminArea) {
                $ownedGroupIds = Group::query()->where('owner_player_id', $user->id)->pluck('id');
                $singleOwnedGroupId = $ownedGroupIds->count() === 1 ? $ownedGroupIds->first() : null;
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user
                    ? [
                        ...$user->toArray(),
                        'can_access_player_admin_area' => $canAccessPlayerAdminArea,
                        'home_route' => $canAccessPlayerAdminArea
                            ? route('admin.home')
                            : route('player.home'),
                        'single_owned_group_id' => $singleOwnedGroupId,
                    ]
                    : null,
            ],
        ];
    }
}
