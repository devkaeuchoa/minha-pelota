import Form from './Form';
import { Group, PageProps } from '@/types';

interface EditProps extends PageProps {
  group: Group;
  defaultTeamSize: number | null;
}

export default function Edit({ group, ...props }: EditProps) {
  return (
    <Form
      {...props}
      group={group}
      submitUrl={route('groups.update', group)}
      method="put"
      title="Config do grupo"
    />
  );
}
