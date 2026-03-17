<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateGroupPlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (app()->environment('local')) {
            return true;
        }

        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'is_admin' => ['sometimes', 'boolean'],
            'physical_condition' => ['sometimes', 'string', 'max:50'],
        ];
    }
}
