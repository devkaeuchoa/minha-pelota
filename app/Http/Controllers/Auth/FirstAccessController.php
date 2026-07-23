<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Player;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class FirstAccessController extends Controller
{
    /**
     * Display the first-access (bootstrap admin) view.
     */
    public function create(): Response|RedirectResponse
    {
        if (Player::query()->where('is_admin', true)->exists()) {
            return redirect()->route('register')
                ->with('status', 'Já existe um administrador cadastrado. Crie uma conta normal abaixo.');
        }

        return Inertia::render('Auth/FirstAccess');
    }

    /**
     * Handle the bootstrap admin registration request.
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

        $user = DB::transaction(function () use ($request) {
            if (Player::query()->where('is_admin', true)->lockForUpdate()->exists()) {
                return null;
            }

            return Player::create([
                'name' => $request->name,
                'nick' => $request->nickname ?? $request->name,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'is_admin' => true,
            ]);
        });

        if ($user === null) {
            return redirect()->route('register')
                ->with('status', 'Já existe um administrador cadastrado. Crie uma conta normal abaixo.');
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('admin.home', absolute: false));
    }
}
