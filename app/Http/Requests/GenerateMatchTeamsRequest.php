<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateMatchTeamsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'team_size' => ['sometimes', 'nullable', 'integer', 'min:2', 'max:50'],
        ];
    }
}
