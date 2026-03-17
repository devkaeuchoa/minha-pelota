<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function store(StoreGroupRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (app()->environment('local')) {
            $data['owner_id'] = $request->user()?->id ?? User::firstOrCreate(
                ['email' => 'dev@localhost.dev'],
                ['name' => 'Dev User', 'password' => bcrypt('password')]
            )->id;
        } else {
            $data['owner_id'] = $request->user()->id;
        }

        $group = Group::create($data);

        return redirect()->route('groups.show', $group);
    }

    public function update(UpdateGroupRequest $request, Group $group): RedirectResponse
    {
        $this->authorizeOwner($request, $group);

        $group->update($request->validated());

        return redirect()->route('groups.show', $group);
    }

    public function destroy(Request $request, Group $group): RedirectResponse
    {
        $this->authorizeOwner($request, $group);

        $group->delete();

        return redirect()->route('groups.index');
    }

    public function destroyMany(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);

        if (! is_array($ids) || $ids === []) {
            return redirect()->route('groups.index');
        }

        $query = Group::query()->whereIn('id', $ids);

        if (! app()->environment('local')) {
            $query->where('owner_id', $request->user()->id);
        }

        $query->delete();

        return redirect()->route('groups.index');
    }

    private function authorizeOwner(Request $request, Group $group): void
    {
        if (app()->environment('local')) {
            return;
        }

        abort_unless(
            $group->owner_id === $request->user()->id,
            403,
            'You are not allowed to access this group.'
        );
    }
}
