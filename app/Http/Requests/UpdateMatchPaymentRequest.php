<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMatchPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'payment_status' => ['required', 'string', 'in:paid,unpaid'],
            'paid_amount' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'is_monthly_exempt' => ['required', 'boolean'],
        ];
    }
}
