<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Models\Group;
use App\Services\Groups\GroupInviteTokenService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function __construct(private readonly GroupInviteTokenService $inviteTokenService) {}

    public function store(StoreGroupRequest $request): RedirectResponse
    {
        abort_unless((bool) ($request->user()?->is_admin ?? false), 403, 'Only admins can own groups.');

        $data = $request->validated();
        $weekday = (int) ($data['weekday'] ?? 0);
        $time = (string) ($data['time'] ?? '20:00');
        $recurrence = (string) ($data['recurrence'] ?? 'weekly');
        $settingsData = [
            'monthly_fee' => (float) ($data['monthly_fee'] ?? 0),
            'drop_in_fee' => (float) ($data['drop_in_fee'] ?? 0),
            'default_weekday' => $weekday,
            'default_time' => $time,
            'recurrence' => $recurrence,
        ];

        unset(
            $data['monthly_fee'],
            $data['drop_in_fee'],
            $data['recurrence']
        );
        $data['weekday'] = $weekday;
        $data['time'] = $time;
        $data['recurrence'] = $recurrence;

        $data['owner_player_id'] = $request->user()->id;
        $group = Group::create($data);
        $group->players()->syncWithoutDetaching([$request->user()->id]);
        $group->settings()->updateOrCreate([], $settingsData);
        $this->inviteTokenService->ensureValidToken($group);

        return redirect()->route('groups.show', $group);
    }

    public function update(UpdateGroupRequest $request, Group $group): RedirectResponse
    {
        $this->authorizeOwner($request, $group);

        $data = $request->validated();
        $settingsData = [];

        foreach (['monthly_fee', 'drop_in_fee', 'weekday', 'time', 'recurrence'] as $key) {
            if (array_key_exists($key, $data)) {
                $settingsData[$key] = $data[$key];
                unset($data[$key]);
            }
        }
        if (array_key_exists('weekday', $settingsData)) {
            $data['weekday'] = (int) $settingsData['weekday'];
            $settingsData['default_weekday'] = (int) $settingsData['weekday'];
            unset($settingsData['weekday']);
        }
        if (array_key_exists('time', $settingsData)) {
            $data['time'] = (string) $settingsData['time'];
            $settingsData['default_time'] = (string) $settingsData['time'];
            unset($settingsData['time']);
        }
        if (array_key_exists('recurrence', $settingsData)) {
            $data['recurrence'] = (string) $settingsData['recurrence'];
        }

        if ($data !== []) {
            $group->update($data);
        }

        if ($settingsData !== []) {
            $group->settings()->updateOrCreate([], $settingsData);
        }

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

        $query->where('owner_player_id', $request->user()->id);

        $query->delete();

        return redirect()->route('groups.index');
    }

    public function regenerateInvite(Request $request, Group $group): RedirectResponse
    {
        $this->authorizeOwner($request, $group);
        $this->inviteTokenService->regenerate($group);

        return redirect()->route('groups.show', $group);
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
