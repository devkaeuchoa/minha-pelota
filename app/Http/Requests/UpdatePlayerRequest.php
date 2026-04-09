<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $playerId = $this->route('player')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'nick' => ['sometimes', 'string', 'max:60'],
            'phone' => ['sometimes', 'string', 'max:20', 'unique:players,phone,' . $playerId],
            'rating' => ['sometimes', 'nullable', 'integer', 'between:1,5'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('phone')) {
            $this->merge([
                'phone' => preg_replace('/\D/', '', $this->input('phone')),
            ]);
        }
    }
}
