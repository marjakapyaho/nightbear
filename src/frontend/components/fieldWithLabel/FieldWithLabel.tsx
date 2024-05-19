import React from 'react';
import styles from './FieldWithLabel.module.scss';

type Props = {
  label: string;
  children: React.ReactNode;
};

export const FieldWithLabel = ({ label, children }: Props) => {
  return (
    <label className={styles.fieldWithLabel}>
      <span className={styles.label}>{label}</span>
      <span className={styles.field}>{children}</span>
    </label>
  );
};
