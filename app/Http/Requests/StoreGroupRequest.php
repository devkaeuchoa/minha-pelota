<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (app()->environment('local')) {
            return true;
        }

        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:150', 'unique:groups,slug'],
            'weekday' => ['required', 'string', 'max:10'],
            'time' => ['required', 'date_format:H:i'],
            'location_name' => ['required', 'string', 'max:150'],
            'status' => ['sometimes', 'string', 'max:20'],
            'max_players' => ['nullable', 'integer', 'min:0', 'max:255'],
            'max_guests' => ['nullable', 'integer', 'min:0', 'max:255'],
            'allow_guests' => ['boolean'],
            'default_match_duration_minutes' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'join_mode' => ['sometimes', 'string', 'max:20'],
            'invite_code' => ['nullable', 'string', 'max:50', 'unique:groups,invite_code'],
            'join_approval_required' => ['boolean'],
            'has_monthly_fee' => ['boolean'],
            'monthly_fee_cents' => ['nullable', 'integer', 'min:0'],
            'payment_day' => ['nullable', 'integer', 'min:1', 'max:31'],
            'currency' => ['sometimes', 'string', 'size:3'],
        ];
    }
}

