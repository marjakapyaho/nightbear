import React, { useEffect, useState } from 'react';
import styles from 'frontend/pages/config/Config.module.scss';
import { Profile } from 'shared/types/profiles';
import { InputNumber } from 'frontend/components/inputNumber/InputNumber';
import { InputText } from 'frontend/components/inputText/InputText';

type Props = {
  label: string;
  children: React.ReactNode;
};

export const EditableProfileRow = ({ label, children }: Props) => {
  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      <div className={styles.field}>{children}</div>
    </div>
  );
};
