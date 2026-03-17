import Form from './Form';
import { PageProps } from '@/types';

export default function Create(props: PageProps) {
  return (
    <Form
      {...props}
      group={null}
      submitUrl={route('groups.store')}
      method="post"
      title="Criar grupo"
    />
  );
}
