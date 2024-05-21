import styles from './Stats.module.scss';

type Props = {
  title: string;
  subtitle: string;
  figure: number | string;
  color: string;
};

export const StatLine = ({ title, subtitle, figure, color }: Props) => {
  return (
    <div className={styles.statLine}>
      <div>
        <span className={styles.title}>{title}</span>
        <span className={styles.subTitle}>{subtitle}</span>
      </div>
      <span className={styles.figure} style={{ color }}>
        {figure}
      </span>
    </div>
  );
};
