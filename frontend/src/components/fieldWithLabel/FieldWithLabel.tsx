import React from 'react';
import styles from './FieldWithLabel.module.scss';

type Props = {
  label: string;
  children: React.ReactNode;
  unit?: string;
};

export const FieldWithLabel = ({ label, children, unit }: Props) => {
  return (
    <label className={styles.fieldWithLabel}>
      <span className={styles.label}>{label}</span>
      <span className={styles.field}>{children}</span>
      {unit && <span className={styles.unit}>{unit}</span>}
    </label>
  );
};
