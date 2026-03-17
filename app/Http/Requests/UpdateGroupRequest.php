<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGroupRequest extends FormRequest
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
        $groupId = $this->route('group')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'slug' => [
                'sometimes',
                'string',
                'max:150',
                Rule::unique('groups', 'slug')->ignore($groupId),
            ],
            'weekday' => ['sometimes', 'integer', 'min:0', 'max:6'],
            'time' => ['sometimes', 'date_format:H:i'],
            'location_name' => ['sometimes', 'string', 'max:150'],
            'status' => ['sometimes', 'string', 'max:20'],
            'max_players' => ['nullable', 'integer', 'min:0', 'max:255'],
            'max_guests' => ['nullable', 'integer', 'min:0', 'max:255'],
            'allow_guests' => ['boolean'],
            'default_match_duration_minutes' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'join_mode' => ['sometimes', 'string', 'max:20'],
            'invite_code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('groups', 'invite_code')->ignore($groupId),
            ],
            'join_approval_required' => ['boolean'],
            'has_monthly_fee' => ['boolean'],
            'monthly_fee_cents' => ['nullable', 'integer', 'min:0'],
            'payment_day' => ['nullable', 'integer', 'min:1', 'max:31'],
            'currency' => ['sometimes', 'string', 'size:3'],
        ];
    }
}

