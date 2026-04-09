/* global route */
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import {
  RetroAccordion,
  RetroButton,
  RetroFormField,
  RetroIconButton,
  RetroInfoCard,
  RetroInlineInfo,
  RetroModal,
  RetroPasswordInput,
  RetroTextInput,
  RetroValueDisplay,
} from '@/Components/retro';
import { PageProps } from '@/types';
import { maskPhone, normalizePhone } from '@/utils/phone';

interface ProfileEditProps extends PageProps {
  status?: string;
  profileData: {
    name: string;
    nickname?: string | null;
    phone?: string | null;
  };
  groups: Array<{ id: number; name: string; is_admin: boolean }>;
  stats: {
    month_label: string;
    month: { goals: number; assists: number; games_played: number; games_missed: number };
    historical: { goals: number; assists: number; games_played: number; games_missed: number };
  };
}

export default function Edit({ status, profileData, groups, stats }: ProfileEditProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPhoneConfirmModal, setShowPhoneConfirmModal] = useState(false);

  const profileForm = useForm({
    name: profileData.name ?? '',
    nickname: profileData.nickname ?? '',
    phone: maskPhone(profileData.phone ?? ''),
  });
  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const deleteAccountForm = useForm({
    password: '',
  });
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const phoneChanged = useMemo(
    () => normalizePhone(profileForm.data.phone) !== normalizePhone(profileData.phone ?? ''),
    [profileForm.data.phone, profileData.phone],
  );

  const submitProfileUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (phoneChanged) {
      setShowPhoneConfirmModal(true);
      return;
    }
    profileForm.patch(route('profile.update'), {
      preserveScroll: true,
      onSuccess: () => setIsEditingProfile(false),
    });
  };

  const confirmPhoneUpdate = () => {
    profileForm.patch(route('profile.update'), {
      preserveScroll: true,
      onSuccess: () => setIsEditingProfile(false),
      onFinish: () => setShowPhoneConfirmModal(false),
    });
  };

  const submitPasswordUpdate = (e: FormEvent) => {
    e.preventDefault();
    passwordForm.put(route('password.update'), {
      preserveScroll: true,
      onSuccess: () => passwordForm.reset('current_password', 'password', 'password_confirmation'),
    });
  };

  const confirmDeleteAccount = () => {
    deleteAccountForm.delete(route('profile.destroy'), {
      preserveScroll: true,
      onSuccess: () => {
        deleteAccountForm.reset();
        setShowDeleteAccountModal(false);
      },
    });
  };

  const cancelEditingProfile = () => {
    setIsEditingProfile(false);
    profileForm.reset();
    profileForm.clearErrors();
  };

  return (
    <RetroAppShell activeId="profile">
      <Head title="Perfil" />

      <div className="retro-bg-metallic-dark retro-border-emboss flex items-center justify-between py-0.5 px-2">
        <h2 className="retro-text-shadow m-0 text-xl tracking-wider text-[#ffd700]">
          PERFIL DO USUÁRIO
        </h2>
        {!isEditingProfile ? (
          <RetroIconButton
            icon="✎"
            aria-label="Editar perfil"
            onClick={() => setIsEditingProfile(true)}
          />
        ) : null}
      </div>

      <RetroInfoCard>
        {status ? <RetroInlineInfo message={status} /> : null}

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex min-w-[160px] flex-col items-center justify-center gap-2 rounded border-2 border-[#4060c0] bg-[#0b1340] p-3">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#ffd700] bg-[#1e348c] text-4xl">
              👤
            </div>
            <span className="retro-text-shadow text-sm text-[#a0b0ff]">FOTO EM BREVE</span>
          </div>

          {isEditingProfile ? (
            <form onSubmit={submitProfileUpdate} className="grid flex-1 gap-2 md:grid-cols-2">
              <RetroFormField label="NOME" htmlFor="profile_name">
                <RetroTextInput
                  id="profile_name"
                  value={profileForm.data.name}
                  onChange={(e) => profileForm.setData('name', e.target.value)}
                />
                {profileForm.errors.name ? (
                  <p className="retro-text-shadow text-sm text-[#ff0055]">
                    {profileForm.errors.name}
                  </p>
                ) : null}
              </RetroFormField>

              <RetroFormField label="APELIDO" htmlFor="profile_nickname">
                <RetroTextInput
                  id="profile_nickname"
                  value={profileForm.data.nickname}
                  onChange={(e) => profileForm.setData('nickname', e.target.value)}
                />
                {profileForm.errors.nickname ? (
                  <p className="retro-text-shadow text-sm text-[#ff0055]">
                    {profileForm.errors.nickname}
                  </p>
                ) : null}
              </RetroFormField>

              <RetroFormField label="TELEFONE" htmlFor="profile_phone">
                <RetroTextInput
                  id="profile_phone"
                  type="tel"
                  value={profileForm.data.phone}
                  onChange={(e) => profileForm.setData('phone', maskPhone(e.target.value))}
                />
                {profileForm.errors.phone ? (
                  <p className="retro-text-shadow text-sm text-[#ff0055]">
                    {profileForm.errors.phone}
                  </p>
                ) : null}
              </RetroFormField>

              <div className="flex flex-col w-full text-center gap-2">
                <RetroButton type="submit" variant="success" disabled={profileForm.processing}>
                  SALVAR DADOS BÁSICOS
                </RetroButton>
                <RetroButton type="button" variant="neutral" onClick={cancelEditingProfile}>
                  CANCELAR
                </RetroButton>
              </div>
            </form>
          ) : (
            <div className="grid flex-1 gap-2 md:grid-cols-2">
              <RetroValueDisplay label="NOME" value={profileData.name || '-'} />
              <RetroValueDisplay label="APELIDO" value={profileData.nickname || '-'} />
              <RetroValueDisplay
                label="TELEFONE"
                value={maskPhone(profileData.phone || '') || '-'}
              />
            </div>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded border-2 border-[#4060c0] bg-[#0b1340] p-2">
            <div className="retro-text-shadow mb-2 text-base text-[#a0b0ff]">
              SUAS ESTATÍSTICAS ({stats.month_label.toUpperCase()})
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <RetroValueDisplay label="GOLS" value={String(stats.month.goals)} />
              <RetroValueDisplay label="ASSISTÊNCIAS" value={String(stats.month.assists)} />
              <RetroValueDisplay
                label="JOGOS REALIZADOS"
                value={String(stats.month.games_played)}
              />
              <RetroValueDisplay label="JOGOS PERDIDOS" value={String(stats.month.games_missed)} />
            </div>
          </div>
          <div className="rounded border-2 border-[#4060c0] bg-[#0b1340] p-2">
            <div className="retro-text-shadow mb-2 text-base text-[#a0b0ff]">
              SUAS ESTATÍSTICAS (HISTÓRICO)
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <RetroValueDisplay label="GOLS" value={String(stats.historical.goals)} />
              <RetroValueDisplay label="ASSISTÊNCIAS" value={String(stats.historical.assists)} />
              <RetroValueDisplay
                label="JOGOS REALIZADOS"
                value={String(stats.historical.games_played)}
              />
              <RetroValueDisplay
                label="JOGOS PERDIDOS"
                value={String(stats.historical.games_missed)}
              />
            </div>
          </div>
        </div>

        <div className="rounded border-2 border-[#4060c0] bg-[#0b1340] p-2">
          <div className="retro-text-shadow mb-2 text-base text-[#a0b0ff]">GRUPOS INSCRITOS</div>
          {groups.length > 0 ? (
            <div className="flex flex-col gap-1">
              {groups.map((group) => (
                <span key={group.id} className="retro-text-shadow text-sm text-white">
                  - {group.name} {group.is_admin ? '(ADMIN)' : '(JOGADOR)'}
                </span>
              ))}
            </div>
          ) : (
            <span className="retro-text-shadow text-sm text-[#e5e7eb]">
              Você ainda não está inscrito em grupos.
            </span>
          )}
        </div>

        <RetroAccordion title="ALTERAR SENHA" defaultOpen={false}>
          <form onSubmit={submitPasswordUpdate} className="flex flex-col gap-3">
            <RetroPasswordInput
              label="SENHA ATUAL"
              value={passwordForm.data.current_password}
              onChange={(e) => passwordForm.setData('current_password', e.target.value)}
              autoComplete="current-password"
            />
            {passwordForm.errors.current_password ? (
              <p className="retro-text-shadow text-sm text-[#ff0055]">
                {passwordForm.errors.current_password}
              </p>
            ) : null}
            <RetroPasswordInput
              label="NOVA SENHA"
              value={passwordForm.data.password}
              onChange={(e) => passwordForm.setData('password', e.target.value)}
              autoComplete="new-password"
            />
            {passwordForm.errors.password ? (
              <p className="retro-text-shadow text-sm text-[#ff0055]">
                {passwordForm.errors.password}
              </p>
            ) : null}
            <RetroPasswordInput
              label="CONFIRMAR SENHA"
              value={passwordForm.data.password_confirmation}
              onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
              autoComplete="new-password"
            />
            {passwordForm.errors.password_confirmation ? (
              <p className="retro-text-shadow text-sm text-[#ff0055]">
                {passwordForm.errors.password_confirmation}
              </p>
            ) : null}
            <div className="mt-1">
              <RetroButton type="submit" variant="success" disabled={passwordForm.processing}>
                ATUALIZAR SENHA
              </RetroButton>
            </div>
          </form>
        </RetroAccordion>

        <RetroAccordion title="EXCLUIR CONTA" defaultOpen={false}>
          <p className="retro-text-shadow text-sm text-[#a0b0ff]">
            A exclusão é permanente. Você precisará informar sua senha para confirmar.
          </p>
          <RetroButton
            type="button"
            variant="danger"
            onClick={() => {
              deleteAccountForm.clearErrors();
              deleteAccountForm.reset();
              setShowDeleteAccountModal(true);
            }}
          >
            EXCLUIR MINHA CONTA
          </RetroButton>
        </RetroAccordion>
      </RetroInfoCard>

      <RetroModal
        open={showPhoneConfirmModal}
        title="CONFIRMAR ALTERAÇÃO DE TELEFONE"
        message={
          <span>
            O telefone é o identificador principal no sistema. Tem certeza que deseja alterar de{' '}
            <strong>{maskPhone(profileData.phone ?? '') || '-'}</strong> para{' '}
            <strong>{profileForm.data.phone}</strong>?
          </span>
        }
        onCancel={() => setShowPhoneConfirmModal(false)}
        onConfirm={confirmPhoneUpdate}
        confirmText="SIM, ALTERAR"
        cancelText="NÃO"
        processing={profileForm.processing}
      />

      <RetroModal
        open={showDeleteAccountModal}
        title="CONFIRMAR EXCLUSÃO DA CONTA"
        message={
          <div className="flex flex-col gap-3">
            <span className="retro-text-shadow text-sm text-[#a0b0ff]">
              Esta ação não pode ser desfeita. Digite sua senha para confirmar.
            </span>
            <RetroPasswordInput
              id="delete_account_password"
              label="SENHA ATUAL"
              value={deleteAccountForm.data.password}
              onChange={(e) => deleteAccountForm.setData('password', e.target.value)}
              autoComplete="current-password"
            />
            {deleteAccountForm.errors.password ? (
              <p className="retro-text-shadow text-sm text-[#ff0055]">
                {deleteAccountForm.errors.password}
              </p>
            ) : null}
          </div>
        }
        onCancel={() => {
          setShowDeleteAccountModal(false);
          deleteAccountForm.reset();
          deleteAccountForm.clearErrors();
        }}
        onConfirm={confirmDeleteAccount}
        confirmText="CONFIRMAR EXCLUSÃO"
        cancelText="CANCELAR"
        processing={deleteAccountForm.processing}
      />
    </RetroAppShell>
  );
}
