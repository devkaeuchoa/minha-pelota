<?php

namespace App\Http\Requests;

use App\Models\Game;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;

class UpdateGroupMatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $groupId = (int) ($this->route('group')?->id ?? 0);
        $matchId = (int) ($this->route('match')?->id ?? 0);

        return [
            'scheduled_at' => [
                'required',
                'date_format:Y-m-d\TH:i',
                function (string $attribute, mixed $value, \Closure $fail) use ($groupId, $matchId): void {
                    $scheduledAt = CarbonImmutable::createFromFormat(
                        'Y-m-d\TH:i',
                        (string) $value,
                        config('app.timezone')
                    );

                    $exists = Game::query()
                        ->where('group_id', $groupId)
                        ->where('scheduled_at', $scheduledAt)
                        ->where('id', '!=', $matchId)
                        ->exists();

                    if ($exists) {
                        $fail('Já existe uma partida neste horário para este grupo.');
                    }
                },
            ],
            'location_name' => ['nullable', 'string', 'max:150'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'status' => ['required', 'string', 'in:scheduled,cancelled,finished'],
        ];
    }
}
