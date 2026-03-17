import { RetroBannerAlert, RetroButton, RetroFormField, RetroTextInput } from '@/Components/retro';

interface GroupInviteSectionProps {
  inviteUrl: string | null;
  processing: boolean;
  onGenerateInvite: () => void;
  onCopyInvite: () => void;
}

export function GroupInviteSection({
  inviteUrl,
  processing,
  onGenerateInvite,
  onCopyInvite,
}: GroupInviteSectionProps) {
  if (inviteUrl) {
    return (
      <div className="flex flex-col gap-3">
        <RetroBannerAlert message="LINK DE CONVITE ATIVO" />
        <RetroFormField label="LINK DO CONVITE" htmlFor="group_invite_url">
          <RetroTextInput
            id="group_invite_url"
            readOnly
            value={inviteUrl}
            onClick={onCopyInvite}
          />
        </RetroFormField>
        <div className="flex gap-3">
          <RetroButton type="button" variant="success" onClick={onCopyInvite}>
            COPIAR LINK
          </RetroButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <RetroBannerAlert message="NENHUM LINK DE CONVITE ATIVO" />
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
    </div>
  );
}
