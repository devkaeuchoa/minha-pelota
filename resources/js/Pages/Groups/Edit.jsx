import React from 'react';
import Form from './Form';

export default function Edit(props) {
  const { group } = props;

  return (
    <Form
      {...props}
      group={group}
      submitUrl={route('groups.update', group)}
      method="put"
      title="Editar grupo"
    />
  );
}
