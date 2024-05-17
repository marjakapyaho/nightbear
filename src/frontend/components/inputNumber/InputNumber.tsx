import React, { useEffect, useState } from 'react';
import styles from './InputNumber.module.scss';
import {
  isNumberValid,
  numberToUINumber,
  replaceCommaWithDot,
  toValidNumber,
} from 'shared/utils/numbers';

type Props = {
  value: number;
  setValue: (val: number) => void;
  decimals: number;
};

export const InputNumber = ({ value, setValue, decimals }: Props) => {
  const [localValue, setLocalValue] = useState(numberToUINumber(value, decimals));

  const commitChanges = (val: string) => {
    setValue(toValidNumber(val));
  };

  useEffect(() => {
    if (value !== toValidNumber(localValue, decimals)) {
      setLocalValue(numberToUINumber(value, decimals));
    }
  }, [value]);

  return (
    <input
      className={styles.input}
      value={localValue}
      onChange={event => {
        const val = event.target.value;
        setLocalValue(replaceCommaWithDot(val));
        if (isNumberValid(val)) {
          commitChanges(val);
        }
      }}
      onBlur={() => {
        setLocalValue(numberToUINumber(value, decimals));
      }}
    />
  );
};
