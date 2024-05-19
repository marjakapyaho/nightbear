import styles from './ScrollableGraph.module.scss';
import React from 'react';
import { GraphConfig, Point, tsToLeft, valToTop } from './scrollableGraphUtils';

type Props = {
  point: Point;
  isSelected: boolean;
  setSelected: (model: Point) => void;
  config: GraphConfig;
  fill?: string;
};

export const GraphPoint = ({ point, isSelected, setSelected, config }: Props) => {
  const { val, timestamp, meterEntry } = point;
  const pointWidth = config.dataTimeStep * config.pixelsPerMs;

  return (
    <>
      {val && (
        <circle
          className={styles.graphPoint}
          cx={tsToLeft(config, timestamp)}
          cy={valToTop(config, val)}
          style={
            {
              pointerEvents: 'auto',
              fill: point.color,
              r: isSelected ? 5 : 3.7,
              zIndex: 100,
            } as any // Type defs won't accept "r"
          }
        />
      )}
      {meterEntry && (
        <circle
          className={styles.graphPoint}
          cx={tsToLeft(config, timestamp)}
          cy={valToTop(config, meterEntry.bloodGlucose)}
          style={
            {
              pointerEvents: 'auto',
              fill: '#828282',
              r: isSelected ? 5 : 3.7,
              zIndex: 100,
            } as any // Type defs won't accept "r"
          }
        />
      )}
      <rect
        className={styles.graphPointClickArea}
        x={tsToLeft(config, timestamp) - pointWidth / 2}
        y={config.paddingTop}
        width={pointWidth}
        height={config.innerHeight}
        onClick={() => setSelected(point)}
      />
    </>
  );
};
