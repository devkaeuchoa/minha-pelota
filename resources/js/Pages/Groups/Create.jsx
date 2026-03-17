import React from 'react';
import Form from './Form';

export default function Create(props) {
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
