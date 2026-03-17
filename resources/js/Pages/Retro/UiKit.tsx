import { Head } from '@inertiajs/react';
import {
  RetroLayout,
  RetroTitleBar,
  RetroSectionHeader,
  RetroPanel,
  RetroModeSelect,
  RetroSegmentedControl,
  RetroLevelSelector,
  RetroValueDisplay,
  RetroTeamCard,
  RetroStatsPanel,
  RetroStatBar,
  RetroStatusPill,
  RetroBannerAlert,
  RetroInlineInfo,
  RetroControlHintBar,
  RetroTextInput,
  RetroPasswordInput,
  RetroTextarea,
  RetroCheckbox,
  RetroRadio,
  RetroSelect,
  RetroSlider,
  RetroNumberStepper,
  RetroFileInput,
  RetroDatePicker,
  RetroButton,
} from '@/Components/retro';

export default function UiKit() {
  return (
    <>
      <Head title="Retro UI Kit" />
      <RetroLayout>
        <RetroTitleBar title="UI COMPONENTS" />

        <NavigationSection />
        <ControlsSection />
        <CardsSection />
        <AlertsSection />
        <FormSection />

        <div className="retro-bg-metallic retro-border-emboss mt-2 py-1 px-4 text-center">
          <span className="retro-text-shadow text-sm text-[#a0b0ff]">
            &copy;1995-2025 KONAMI DREAM TEAM STUDIOS
          </span>
        </div>
      </RetroLayout>
    </>
  );
}

function NavigationSection() {
  return (
    <div className="flex flex-col gap-2">
      <RetroSectionHeader title="1. NAVIGATION" />
      <RetroModeSelect
        title="MODE SELECT"
        modes={[
          { id: 'exhibition', label: 'EXHIBITION MODE' },
          { id: 'league', label: 'LEAGUE MODE' },
          { id: 'cup', label: 'CUP MODE' },
        ]}
        activeId="league"
      />
    </div>
  );
}

function ControlsSection() {
  return (
    <div className="flex flex-col gap-2">
      <RetroSectionHeader title="2. CONTROLS & INPUTS" />
      <RetroPanel>
        <RetroSegmentedControl
          label="CONDITION"
          options={[
            { id: 'day', label: 'DAY' },
            { id: 'night', label: 'NIGHT' },
          ]}
          activeId="day"
        />
        <RetroLevelSelector
          label="DIFFICULTY"
          levels={[
            { id: '1', label: 'LV.1' },
            { id: '2', label: 'LV.2' },
            { id: '3', label: 'LV.3' },
            { id: '4', label: 'LV.4' },
          ]}
          activeId="2"
        />
        <RetroValueDisplay label="PLAYER NAME" value="P.JONES_" />
      </RetroPanel>
    </div>
  );
}

function CardsSection() {
  return (
    <div className="flex flex-col gap-2">
      <RetroSectionHeader title="3. CARDS & PANELS" />
      <RetroTeamCard teamName="ENGLAND" playerLabel="1P" formation="4-4-2" />
      <RetroStatsPanel title="TEAM STATISTICS">
        <RetroStatBar label="GK" value={75} variant="purple" />
        <RetroStatBar label="DF" value={85} variant="green" />
        <RetroStatBar label="MF" value={90} variant="yellow" />
        <RetroStatBar label="FW" value={70} variant="pink" />
      </RetroStatsPanel>
    </div>
  );
}

function AlertsSection() {
  return (
    <div className="flex flex-col gap-2">
      <RetroSectionHeader title="4. ALERTS & TAGS" />
      <div className="flex flex-wrap gap-2">
        <RetroStatusPill status="on" label="ON" />
        <RetroStatusPill status="off" label="OFF" />
        <RetroBannerAlert message="COMPLETE!" />
      </div>
      <RetroInlineInfo message="PRACTICE SHOOTING, PASSING AND KICKING." />
      <div className="mt-2">
        <RetroControlHintBar
          hints={[
            { key: 'A', label: 'CONFIRM', color: '#39ff14' },
            { key: 'B', label: 'CANCEL', color: '#ff0055' },
          ]}
        />
      </div>
    </div>
  );
}

function FormSection() {
  return (
    <div className="mt-2 flex flex-col gap-2">
      <RetroSectionHeader title="5. FORM COMPONENTS" />
      <RetroPanel>
        <RetroTextInput label="EMAIL ADDRESS" type="email" placeholder="PLAYER@GAME.COM" />
        <RetroPasswordInput label="PASSWORD" defaultValue="password" />
        <RetroTextarea label="BIO / DESCRIPTION" rows={3} placeholder="ENTER TEAM DESCRIPTION..." />
        <RetroCheckbox label="HOME STADIUM" checked />
        <RetroCheckbox label="SUBSTITUTE PLAYER" />
        <RetroRadio
          label="POSITION"
          options={[
            { id: 'gk', label: 'GOALKEEPER' },
            { id: 'df', label: 'DEFENDER' },
            { id: 'mf', label: 'MIDFIELDER' },
            { id: 'st', label: 'STRIKER' },
          ]}
          activeId="gk"
        />
        <RetroSelect
          label="FORMATION"
          options={[
            { value: '4-4-2', label: '4-4-2' },
            { value: '4-3-3', label: '4-3-3' },
            { value: '3-5-2', label: '3-5-2' },
            { value: '5-3-2', label: '5-3-2' },
            { value: '4-2-3-1', label: '4-2-3-1' },
          ]}
        />
        <RetroDatePicker
          label="BIRTH DATE"
          segments={[
            { id: 'year', value: '1985' },
            { id: 'month', value: '07' },
            { id: 'day', value: '14', active: true },
          ]}
        />
        <RetroSlider label="PLAYER RATING" value={75} />
        <RetroFileInput label="UPLOAD PLAYER PHOTO" />
        <RetroNumberStepper label="JERSEY NUMBER" value={10} />
        <div className="mt-2 flex gap-2">
          <RetroButton variant="success">SAVE</RetroButton>
          <RetroButton variant="danger">RESET</RetroButton>
        </div>
      </RetroPanel>
    </div>
  );
}
