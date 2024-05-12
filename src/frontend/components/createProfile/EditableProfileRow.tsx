import React from 'react';
import styles from 'frontend/pages/config/Config.module.scss';

type Props = {
  label: string;
  value: string | number | undefined | null;
  setValue: (val: string) => void;
};

export const EditableProfileRow = ({ label, value, setValue }: Props) => (
  <div className={styles.row}>
    <div className={styles.label}>{label}</div>
    <div className={styles.field}>
      <input
        className={styles.input}
        value={value || ''}
        onChange={event => setValue(event.target.value)}
      />
    </div>
  </div>
);
