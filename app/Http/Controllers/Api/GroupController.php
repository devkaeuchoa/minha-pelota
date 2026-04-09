<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Http\Resources\GroupResource;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class GroupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Group::query()->orderByDesc('created_at');

        $query->where('owner_player_id', $request->user()->id);

        $groups = $query->paginate(
            perPage: (int) $request->integer('per_page', 15),
            page: (int) $request->integer('page', 1)
        );

        return response()->json(GroupResource::collection($groups));
    }

    public function store(StoreGroupRequest $request): JsonResponse
    {
        abort_unless((bool) ($request->user()?->is_admin ?? false), Response::HTTP_FORBIDDEN, 'Only admins can own groups.');

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

        return (new GroupResource($group))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Group $group, Request $request): JsonResponse
    {
        $this->authorizeOwner($request, $group);

        return response()->json(new GroupResource($group));
    }

    public function update(UpdateGroupRequest $request, Group $group): JsonResponse
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

        return response()->json(new GroupResource($group));
    }

    public function destroy(Request $request, Group $group): Response
    {
        $this->authorizeOwner($request, $group);

        $group->delete();

        return response()->noContent();
    }

    private function authorizeOwner(Request $request, Group $group): void
    {
        abort_unless(
            (bool) ($request->user()?->is_admin ?? false) && $group->owner_player_id === $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'You are not allowed to access this group.'
        );
    }
}
