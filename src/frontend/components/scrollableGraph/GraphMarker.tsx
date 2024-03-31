import React from 'react';
import { TimeAgo } from 'frontend/components/timeAgo/TimeAgo';
import styles from './ScrollableGraph.module.scss';
import { GraphConfig, Point, tsToLeft } from './scrollableGraphUtils';

type Props = {
  config: GraphConfig;
  point: Point;
  isSelected: boolean;
  setSelected: (marker: Point) => void;
};

export const GraphMarker = ({ config, point, isSelected, setSelected }: Props) => {
  const hasData = point.valTop || point.valBottom;

  return (
    <div
      className={styles.graphMarker}
      onClick={() => setSelected(point)}
      style={{
        left: tsToLeft(config, point.timestamp) - config.pixelsPerTimeStep / 2,
        width: config.pixelsPerTimeStep,
        zIndex: 10,
      }}
    >
      <div
        className={`${styles.verticalLine} ${hasData && styles.hasData}`}
        style={{ left: config.pixelsPerTimeStep / 2, borderLeft: isSelected ? `1px solid #bbb` : undefined }}
      />

      {(hasData || isSelected) && (
        <span className={`${styles.textLabel} ${isSelected && styles.selected}`}>
          <TimeAgo ts={point.timestamp} />
        </span>
      )}

      {point.valTop && (
        <div
          className={styles.numberBubble}
          style={{ background: point.valTopColor, marginTop: 0.01 * config.innerHeight }}
        >
          {point.val}
        </div>
      )}
      {point.valBottom && (
        <div
          className={styles.numberBubble}
          style={{ background: point.valBottomColor, marginTop: 0.65 * config.innerHeight }}
        >
          {point.val}
        </div>
      )}
    </div>
  );
};
