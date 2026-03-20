<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGroupPlayerRequest;
use App\Http\Requests\UpdateGroupPlayerRequest;
use App\Enums\PhysicalCondition;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class GroupPlayerController extends Controller
{
    public function index(Request $request, Group $group): JsonResponse
    {
        $this->authorizeOwner($request, $group);

        $players = $group->players()
            ->with('groups') // ensure relations available if needed
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'physical_condition' => PhysicalCondition::normalize(
                        $user->physical_condition,
                    )->value,
                    'is_admin' => (bool) $user->pivot->is_admin,
                ];
            });

        return response()->json($players);
    }

    public function store(StoreGroupPlayerRequest $request, Group $group): JsonResponse
    {
        $this->authorizeOwner($request, $group);

        $data = $request->validated();

        abort_if(
            $group->players()->where('user_id', $data['user_id'])->exists(),
            Response::HTTP_UNPROCESSABLE_ENTITY,
            'User is already a member of this group.'
        );

        $group->players()->attach($data['user_id'], [
            'is_admin' => $data['is_admin'] ?? false,
        ]);

        $user = User::findOrFail($data['user_id']);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'physical_condition' => PhysicalCondition::normalize(
                $user->physical_condition,
            )->value,
            'is_admin' => (bool) ($data['is_admin'] ?? false),
        ], Response::HTTP_CREATED);
    }

    public function update(UpdateGroupPlayerRequest $request, Group $group, User $user): JsonResponse
    {
        $this->authorizeOwner($request, $group);

        abort_unless(
            $group->players()->where('user_id', $user->id)->exists(),
            Response::HTTP_NOT_FOUND,
            'User is not a member of this group.'
        );

        $data = $request->validated();

        if (array_key_exists('is_admin', $data)) {
            $group->players()->updateExistingPivot($user->id, [
                'is_admin' => $data['is_admin'],
            ]);
        }

        if (array_key_exists('physical_condition', $data)) {
            $user->physical_condition = PhysicalCondition::normalize(
                $data['physical_condition'],
            )->value;
            $user->save();
        }

        $pivot = $group->players()->where('user_id', $user->id)->firstOrFail()->pivot;

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'physical_condition' => PhysicalCondition::normalize(
                $user->physical_condition,
            )->value,
            'is_admin' => (bool) $pivot->is_admin,
        ]);
    }

    public function destroy(Request $request, Group $group, User $user): Response
    {
        $this->authorizeOwner($request, $group);

        abort_unless(
            $group->players()->where('user_id', $user->id)->exists(),
            Response::HTTP_NOT_FOUND,
            'User is not a member of this group.'
        );

        $group->players()->detach($user->id);

        return response()->noContent();
    }

    private function authorizeOwner(Request $request, Group $group): void
    {
        if (app()->environment('local')) {
            return;
        }

        abort_unless(
            $group->owner_id === $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'You are not allowed to manage players for this group.'
        );
    }
}
