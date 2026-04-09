<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGroupPlayerRequest;
use App\Http\Requests\UpdateGroupPlayerRequest;
use App\Enums\PhysicalCondition;
use App\Models\Group;
use App\Models\Player;
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
            ->map(function (Player $player) {
                return [
                    'id' => $player->id,
                    'name' => $player->name,
                    'phone' => $player->phone,
                    'physical_condition' => PhysicalCondition::normalize(
                        $player->physical_condition,
                    )->value,
                    'is_admin' => (bool) $player->pivot->is_admin,
                ];
            });

        return response()->json($players);
    }

    public function store(StoreGroupPlayerRequest $request, Group $group): JsonResponse
    {
        $this->authorizeOwner($request, $group);

        $data = $request->validated();

        abort_if(
            $group->players()->where('player_id', $data['player_id'])->exists(),
            Response::HTTP_UNPROCESSABLE_ENTITY,
            'Player is already a member of this group.'
        );

        $group->players()->attach($data['player_id'], [
            'is_admin' => $data['is_admin'] ?? false,
        ]);

        $player = Player::findOrFail($data['player_id']);

        return response()->json([
            'id' => $player->id,
            'name' => $player->name,
            'phone' => $player->phone,
            'physical_condition' => PhysicalCondition::normalize(
                $player->physical_condition,
            )->value,
            'is_admin' => (bool) ($data['is_admin'] ?? false),
        ], Response::HTTP_CREATED);
    }

    public function update(UpdateGroupPlayerRequest $request, Group $group, Player $player): JsonResponse
    {
        $this->authorizeOwner($request, $group);

        abort_unless(
            $group->players()->where('player_id', $player->id)->exists(),
            Response::HTTP_NOT_FOUND,
            'Player is not a member of this group.'
        );

        $data = $request->validated();

        if (array_key_exists('is_admin', $data)) {
            $group->players()->updateExistingPivot($player->id, [
                'is_admin' => $data['is_admin'],
            ]);
        }

        if (array_key_exists('physical_condition', $data)) {
            $player->physical_condition = PhysicalCondition::normalize(
                $data['physical_condition'],
            )->value;
            $player->save();
        }

        $pivot = $group->players()->where('player_id', $player->id)->firstOrFail()->pivot;

        return response()->json([
            'id' => $player->id,
            'name' => $player->name,
            'phone' => $player->phone,
            'physical_condition' => PhysicalCondition::normalize(
                $player->physical_condition,
            )->value,
            'is_admin' => (bool) $pivot->is_admin,
        ]);
    }

    public function destroy(Request $request, Group $group, Player $player): Response
    {
        $this->authorizeOwner($request, $group);

        abort_unless(
            $group->players()->where('player_id', $player->id)->exists(),
            Response::HTTP_NOT_FOUND,
            'Player is not a member of this group.'
        );

        $group->players()->detach($player->id);

        return response()->noContent();
    }

    private function authorizeOwner(Request $request, Group $group): void
    {
        abort_unless(
            (bool) ($request->user()?->is_admin ?? false) && $group->owner_player_id === $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'You are not allowed to manage players for this group.'
        );
    }
}
