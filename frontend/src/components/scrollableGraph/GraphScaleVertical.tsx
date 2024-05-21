import { range } from 'lodash';
import { highLimit } from '@nightbear/shared';
import styles from './ScrollableGraph.module.scss';
import { GraphConfig, valToTop } from './scrollableGraphUtils';

type Props = {
  config: GraphConfig;
};

export const GraphScaleVertical = ({ config }: Props) => {
  const graphLines = range(config.valMin, config.valMax + config.valStep, config.valStep);

  return (
    <div className={styles.graphScaleVertical}>
      {config.showTarget && (
        <div
          className={styles.targetArea}
          style={{
            left: config.paddingLeft,
            top: valToTop(config, highLimit),
            right: 0,
          }}
        />
      )}

      <div
        className={styles.verticalAxis}
        style={{
          bottom: config.paddingBottom,
          width: config.paddingRight,
        }}
      >
        {graphLines.map(val => (
          <div
            key={val}
            className={styles.valueLabel}
            style={{
              top: valToTop(config, val) - 4, // Number is dependent on font size and makes label placement nicer
              opacity: val % 2 === 0 ? 1 : 0,
              paddingLeft: config.paddingRight / 2,
            }}
          >
            {val}
          </div>
        ))}
      </div>
    </div>
  );
};
