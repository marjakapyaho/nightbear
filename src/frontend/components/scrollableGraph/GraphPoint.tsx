import styles from './ScrollableGraph.module.scss';
import React from 'react';
import { GraphConfig, Point, tsToLeft, valToTop } from './scrollableGraphUtils';

type Props = {
  point: Point;
  isSelectable: boolean;
  isSelected: boolean;
  setSelected: (model: Point) => void;
  config: GraphConfig;
  fill?: string;
};

export const GraphPoint = ({ point, isSelectable, isSelected, setSelected, config }: Props) => {
  const { val, timestamp } = point;
  const pointWidth = config.pixelsPerTimeStep;

  return (
    <>
      <rect
        x={tsToLeft(config, timestamp) - pointWidth / 2}
        y={config.paddingTop}
        width={pointWidth}
        height={config.innerHeight}
        style={
          {
            fill: 'transparent',
          } as any // TS type defs won't accept "r"
        }
        onClick={() => setSelected(point)}
      />
      {val && (
        <circle
          cx={tsToLeft(config, timestamp)}
          cy={valToTop(config, val)}
          className={styles.graphPoint}
          style={
            {
              pointerEvents: isSelectable ? 'auto' : 'none',
              fill: point.color,
              r: isSelected ? 5 : 3.7,
              zIndex: 100,
            } as any // TS type defs won't accept "r"
          }
        />
      )}
    </>
  );
};
