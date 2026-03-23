<?php

namespace App\Http\Controllers;

use App\Http\Requests\InvitePlayerRequest;
use App\Models\Group;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InviteController extends Controller
{
    public function show(string $inviteCode): Response
    {
        $group = Group::where('invite_code', $inviteCode)->firstOrFail();

        return Inertia::render('Invite/Accept', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'weekday' => $group->weekday,
                'time' => $group->time,
                'location_name' => $group->location_name,
            ],
            'inviteCode' => $inviteCode,
        ]);
    }

    public function store(InvitePlayerRequest $request, string $inviteCode): RedirectResponse
    {
        $group = Group::where('invite_code', $inviteCode)->firstOrFail();

        $data = $request->validated();

        $player = Player::firstOrCreate(
            ['phone' => $data['phone']],
            ['name' => $data['name'], 'nick' => $data['nick']]
        );

        if (! $group->players()->where('player_id', $player->id)->exists()) {
            $group->players()->attach($player->id);
        }

        return redirect()->route('invite.success', $inviteCode);
    }

    public function phoneAvailability(Request $request, string $inviteCode): JsonResponse
    {
        $group = Group::where('invite_code', $inviteCode)->firstOrFail();
        $phone = preg_replace('/\D/', '', (string) $request->query('phone', ''));

        if ($phone === '' || strlen($phone) < 10) {
            return response()->json([
                'available' => false,
                'message' => 'Telefone inválido.',
            ], 422);
        }

        $player = Player::query()->where('phone', $phone)->first();
        if (! $player) {
            return response()->json([
                'available' => true,
                'message' => 'Telefone disponível para cadastro.',
            ]);
        }

        $alreadyInGroup = $group->players()->where('player_id', $player->id)->exists();

        return response()->json([
            'available' => false,
            'message' => $alreadyInGroup
                ? 'Este telefone já está vinculado a este grupo.'
                : 'Este telefone já está cadastrado no sistema.',
        ]);
    }

    public function success(string $inviteCode): Response
    {
        $group = Group::where('invite_code', $inviteCode)->firstOrFail();

        return Inertia::render('Invite/Success', [
            'group' => [
                'name' => $group->name,
            ],
        ]);
    }
}
