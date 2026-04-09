<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'nick' => ['required', 'string', 'max:60'],
            'phone' => ['required', 'string', 'max:20'],
            'rating' => ['nullable', 'integer', 'between:1,5'],
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
