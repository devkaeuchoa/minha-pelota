<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateGroupSettingsRequest;
use App\Models\Group;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GroupSettingsController extends Controller
{
    public function edit(Request $request, Group $group): Response
    {
        $this->authorizeOwner($request, $group);

        return Inertia::render('Groups/Settings/Edit', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
            ],
            'defaultTeamSize' => $group->default_team_size,
            'status' => session('status'),
        ]);
    }

    public function update(UpdateGroupSettingsRequest $request, Group $group): RedirectResponse
    {
        $this->authorizeOwner($request, $group);

        $group->settings()->updateOrCreate([], [
            'default_team_size' => $request->validated('default_team_size'),
        ]);

        return redirect()
            ->route('groups.settings.edit', $group)
            ->with('status', 'Configurações atualizadas.');
    }

    private function authorizeOwner(Request $request, Group $group): void
    {
        abort_unless(
            (bool) ($request->user()?->is_admin ?? false) && $group->owner_player_id === $request->user()->id,
            403,
            'You are not allowed to access this group.'
        );
    }
}
