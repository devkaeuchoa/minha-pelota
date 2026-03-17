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
  return (
    <section className="section section--tight">
      <h3>Convite do grupo</h3>
      {inviteUrl ? (
        <>
          <p>Compartilhe este link para jogadores se cadastrarem no grupo:</p>
          <input type="text" value={inviteUrl} readOnly />
          <button type="button" onClick={onCopyInvite}>
            Copiar link
          </button>
        </>
      ) : (
        <>
          <p>Este grupo ainda não possui um link de convite ativo.</p>
          <button type="button" disabled={processing} onClick={onGenerateInvite}>
            Gerar link de convite
          </button>
        </>
      )}
    </section>
  );
}
