<?php

namespace App\Enums;

enum PhysicalCondition: string
{
    case Otimo = 'otimo';
    case Regular = 'regular';
    case Ruim = 'ruim';
    case Machucado = 'machucado';
    case Unknown = 'unknown';

    public static function normalize(?string $value): self
    {
        if ($value === null) {
            return self::Unknown;
        }

        // Backward compatibility with previous values.
        return match ($value) {
            'fit' => self::Otimo,
            'limited' => self::Regular,
            'injured' => self::Machucado,
            'unknown' => self::Unknown,
            default => self::tryFrom($value) ?? self::Unknown,
        };
    }
}
