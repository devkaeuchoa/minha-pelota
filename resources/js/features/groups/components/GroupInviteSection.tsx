import { RetroAccordion, RetroButton, RetroFormField, RetroTextInput } from '@/Components/retro';
import { useState } from 'react';

interface GroupInviteSectionProps {
  inviteUrl: string | null;
  processing: boolean;
  onGenerateInvite: () => void;
}

export function GroupInviteSection({
  inviteUrl,
  processing,
  onGenerateInvite,
}: GroupInviteSectionProps) {
  const [labelCopied, setLabelCopied] = useState('COPIAR LINK');

  const handleCopyInvite = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setLabelCopied('LINK COPIADO!');
    }
  };
  if (inviteUrl) {
    return (
      <>
        <RetroFormField label="LINK DO CONVITE" htmlFor="group_invite_url">
          <RetroTextInput id="group_invite_url" readOnly value={inviteUrl} />
        </RetroFormField>
        <div className="flex gap-3">
          <RetroButton type="button" variant={'neutral'} size="sm" onClick={handleCopyInvite}>
            {labelCopied}
          </RetroButton>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="retro-text-shadow text-sm text-[#a0b0ff]">
        GERE UM LINK PARA QUE NOVOS JOGADORES ENTREM NO GRUPO.
      </p>
      <div className="flex gap-3">
        <RetroButton
          type="button"
          variant="success"
          disabled={processing}
          onClick={onGenerateInvite}
        >
          GERAR LINK DE CONVITE
        </RetroButton>
      </div>
    </>
  );
}
