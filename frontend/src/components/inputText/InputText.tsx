import styles from './InputText.module.scss';

type Props = {
  value: string;
  setValue: (val: string) => void;
};

export const InputText = ({ value, setValue }: Props) => (
  <input className={styles.input} value={value} onChange={event => setValue(event.target.value)} />
);
