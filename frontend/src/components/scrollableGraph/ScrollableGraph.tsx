import React, { useEffect, useRef } from 'react';
import styles from './ScrollableGraph.module.scss';
import { Point, BaseGraphConfig, getGraphConfig } from './scrollableGraphUtils';
import { GraphScaleVertical } from './GraphScaleVertical';
import { GraphScaleHorizontal } from './GraphScaleHorizontal';
import { GraphMarker } from './GraphMarker';
import { GraphLatestValue } from './GraphLatestValue';
import { GraphSvg } from './GraphSvg';

type Props = {
  graphPoints: Point[];
  baseConfig: BaseGraphConfig;
  selectedPoint: Point | null;
  setSelectedPoint: (point: Point | null) => void;
  latestPointWithBg?: Point;
};

export const ScrollableGraph = ({
  graphPoints,
  selectedPoint,
  setSelectedPoint,
  baseConfig,
  latestPointWithBg,
}: Props) => {
  const scrollingRef = useRef<HTMLDivElement | null>(null);
  const config = getGraphConfig(baseConfig);
  const { innerWidth, outerHeight } = config;
  const latestPoint = graphPoints.length ? graphPoints[0] : null;

  // Scroll right on mount
  useEffect(() => {
    if (!scrollingRef.current) return;
    scrollingRef.current.scrollLeft = scrollingRef.current.scrollWidth;
  }, []);

  return (
    <div className={styles.scrollableGraph} style={{ height: outerHeight }}>
      <GraphScaleVertical config={config} />
      <div className={styles.scrollingLayer} ref={scrollingRef}>
        <div className={styles.scrollingCutoff} style={{ width: innerWidth, height: outerHeight }}>
          {graphPoints.map(point => (
            <GraphMarker
              key={point.timestamp}
              config={config}
              point={point}
              isSelected={selectedPoint?.timestamp === point.timestamp}
              setSelected={setSelectedPoint}
            />
          ))}
          <GraphSvg
            graphPoints={graphPoints}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            config={config}
          />
          <GraphScaleHorizontal config={config} />
          <GraphLatestValue latestPoint={latestPointWithBg || latestPoint} config={config} />
        </div>
      </div>
    </div>
  );
};
