<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:150', 'unique:groups,slug'],
            'location_name' => ['required', 'string', 'max:150'],
            'status' => ['sometimes', 'string', 'max:20'],
            'weekday' => ['required', 'integer', 'min:0', 'max:6'],
            'time' => ['required', 'date_format:H:i'],
            'recurrence' => ['sometimes', 'string', 'in:none,weekly,biweekly,monthly'],
            'max_players' => ['nullable', 'integer', 'min:0', 'max:255'],
            'max_guests' => ['nullable', 'integer', 'min:0', 'max:255'],
            'allow_guests' => ['boolean'],
            'default_match_duration_minutes' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'join_mode' => ['sometimes', 'string', 'max:20'],
            'join_approval_required' => ['boolean'],
            'monthly_fee' => ['nullable', 'numeric', 'min:0'],
            'drop_in_fee' => ['nullable', 'numeric', 'min:0'],
            'payment_day' => ['nullable', 'integer', 'min:1', 'max:31'],
            'currency' => ['sometimes', 'string', 'size:3'],
        ];
    }
}
