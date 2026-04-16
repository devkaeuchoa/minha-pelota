import { RetroButton, RetroModal } from '@/Components/retro';
import { useState } from 'react';

type PendingGenerate = { kind: 'current-month' } | { kind: 'months'; months: number };

interface GroupMatchesQuickActionsSectionProps {
  generateProcessing: boolean;
  onGenerateCurrentMonth: () => void;
  onGenerateForMonths: (months: number) => void;
  onOpenDatesPage: () => void;
}

export function GroupMatchesQuickActionsSection({
  generateProcessing,
  onGenerateCurrentMonth,
  onGenerateForMonths,
  onOpenDatesPage,
}: GroupMatchesQuickActionsSectionProps) {
  const [pendingGenerate, setPendingGenerate] = useState<PendingGenerate | null>(null);
  const presets = [3, 6, 12];

  const handleConfirmGenerate = () => {
    if (!pendingGenerate) return;
    if (pendingGenerate.kind === 'current-month') {
      onGenerateCurrentMonth();
    } else {
      onGenerateForMonths(pendingGenerate.months);
    }
    setPendingGenerate(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="retro-text-shadow text-sm text-[#a0b0ff]">
        ESCOLHA O PERIODO PARA GERAR AS DATAS DAS PARTIDAS.
      </p>

      <div className="grid grid-cols-3 gap-2">
        <RetroButton
          size="sm"
          type="button"
          variant="neutral"
          disabled={generateProcessing}
          onClick={() => setPendingGenerate({ kind: 'current-month' })}
        >
          MÊS ATUAL
        </RetroButton>
        {presets.map((months) => (
          <RetroButton
            key={months}
            size="sm"
            type="button"
            variant="neutral"
            disabled={generateProcessing}
            onClick={() => setPendingGenerate({ kind: 'months', months })}
          >
            {months} MESES
          </RetroButton>
        ))}
      </div>

      <RetroButton type="button" size="sm" variant="success" onClick={onOpenDatesPage}>
        VER TODAS AS DATAS
      </RetroButton>

      <RetroModal
        open={pendingGenerate !== null}
        title="CONFIRMAR GERAÇÃO"
        message={
          <span>
            {pendingGenerate?.kind === 'current-month'
              ? 'Deseja gerar as partidas para o mês atual? Partidas já existentes neste período podem ser mantidas ou recriadas conforme a lógica do sistema.'
              : pendingGenerate
                ? `Deseja gerar as partidas para os próximos ${pendingGenerate.months} ${
                    pendingGenerate.months === 1 ? 'mês' : 'meses'
                  }?`
                : ''}
          </span>
        }
        onCancel={() => setPendingGenerate(null)}
        onConfirm={handleConfirmGenerate}
        confirmText="SIM, GERAR"
        cancelText="NÃO"
        processing={generateProcessing}
        confirmVariant="success"
      />
    </div>
  );
}
