import React, { useEffect, useRef } from 'react';
import styles from './ScrollableGraph.module.scss';
import { Point, BaseGraphConfig, getGraphConfig } from './scrollableGraphUtils';
import { GraphScaleVertical } from 'frontend/components/scrollableGraph/GraphScaleVertical';
import { GraphScaleHorizontal } from 'frontend/components/scrollableGraph/GraphScaleHorizontal';
import { GraphMarker } from 'frontend/components/scrollableGraph/GraphMarker';
import { GraphLatestValue } from 'frontend/components/scrollableGraph/GraphLatestValue';
import { GraphSvg } from 'frontend/components/scrollableGraph/GraphSvg';

type Props = {
  graphPoints: Point[];
  baseConfig: BaseGraphConfig;
  selectedPoint: Point | null;
  setSelectedPoint: (point: Point | null) => void;
};

export const ScrollableGraph = ({ graphPoints, selectedPoint, setSelectedPoint, baseConfig }: Props) => {
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
          <GraphLatestValue latestPoint={latestPoint} config={config} />
        </div>
      </div>
    </div>
  );
};
