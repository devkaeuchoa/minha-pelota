<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Player;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'phone' => preg_replace('/\D/', '', (string) $request->input('phone')),
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:120',
            'phone' => 'required|string|max:20|unique:' . Player::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = Player::create([
            'name' => $request->name,
            'nick' => $request->nickname ?? $request->name,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('player.home', absolute: false));
    }

    public function phoneAvailability(Request $request): JsonResponse
    {
        $phone = preg_replace('/\D/', '', (string) $request->query('phone', ''));

        if ($phone === '' || strlen($phone) < 10) {
            return response()->json([
                'available' => false,
                'message' => 'Telefone inválido.',
            ], 422);
        }

        $isAvailable = ! Player::query()->where('phone', $phone)->exists();

        return response()->json([
            'available' => $isAvailable,
            'message' => $isAvailable ? 'Telefone disponível.' : 'Este telefone já está cadastrado.',
        ]);
    }
}
