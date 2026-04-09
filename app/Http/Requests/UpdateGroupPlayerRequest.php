<?php

namespace App\Http\Requests;

use App\Enums\PhysicalCondition;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateGroupPlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
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
            'physical_condition' => [
                'sometimes',
                'string',
                'max:50',
                'in:'
                    . implode(
                        ',',
                        [
                            PhysicalCondition::Otimo->value,
                            PhysicalCondition::Regular->value,
                            PhysicalCondition::Ruim->value,
                            PhysicalCondition::Machucado->value,
                            PhysicalCondition::Unknown->value,
                            // Legacy values (previous naming used by scripts)
                            'fit',
                            'limited',
                            'injured',
                        ],
                    ),
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('physical_condition')) {
            return;
        }

        $this->merge([
            'physical_condition' => PhysicalCondition::normalize(
                $this->input('physical_condition'),
            )->value,
        ]);
    }
}
