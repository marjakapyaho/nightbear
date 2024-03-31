import React, { useEffect, useRef, useState } from 'react';
import styles from './ScrollableGraph.module.scss';
import { isNotNull } from 'backend/utils/types';
import { GraphConfig, Point, tsToLeft, valToTop, BaseGraphConfig } from './scrollableGraphUtils';
import { GraphPoint } from 'frontend/components/scrollableGraph/GraphPoint';
import { GraphVerticalScale } from './GraphVerticalScale';
import { GraphScaleTimes } from './GraphScaleTimes';
import { timestampIsUnderMaxAge } from 'shared/calculations/calculations';
import { setOneDecimal } from 'frontend/utils/helpers';
import { GraphMarker } from 'frontend/components/scrollableGraph/GraphMarker';

type Props = {
  graphPoints: Point[];
  baseConfig: BaseGraphConfig;
};

export const ScrollableGraph = ({ graphPoints, baseConfig }: Props) => {
  const scrollingRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pixelsPerMs = baseConfig.pixelsPerTimeStep / baseConfig.timeStep;
  const config: GraphConfig = {
    ...baseConfig,
    // when rendering the timescale (i.e. X-axis), this is the first full hour we need to render
    flooredHourStart:
      Math.floor((baseConfig.timelineRangeEnd - baseConfig.timelineRange) / baseConfig.timeStep) * baseConfig.timeStep,
    // regardless of the outer width of the timeline, within it, there will be this many pixels to scroll
    innerWidth: Math.round(pixelsPerMs * baseConfig.timelineRange) + baseConfig.paddingLeft + baseConfig.paddingRight,
    // height of the chart area (i.e. without vertical paddings)
    innerHeight: baseConfig.outerHeight - baseConfig.paddingTop - baseConfig.paddingBottom,
    // this is the less intuitive, but more programmatically useful version of pixelsPerTimeStep
    pixelsPerMs,
  };

  const { innerWidth, outerHeight } = config;
  const [selectedPoint, setSelectedPoint] = useState<Point | null>();
  const latestPoint = graphPoints[0];
  const points = graphPoints
    .map(point => (isNotNull(point.val) ? [tsToLeft(config, point.timestamp), valToTop(config, point.val)].join() : ''))
    .join(' ');

  const scrollRightOnMount = () => {
    if (!scrollingRef.current) return;
    scrollingRef.current.scrollLeft = scrollingRef.current.scrollWidth;
  };

  useEffect(scrollRightOnMount, []);

  return (
    <div className={styles.scrollableGraph} style={{ height: config.outerHeight }}>
      <div className={styles.baseLayerCss}>
        <GraphVerticalScale config={config} />
      </div>
      <div className={styles.scrollingLayerCss} ref={scrollingRef}>
        <div className={styles.scrollingCutoffCss} style={{ width: innerWidth, height: outerHeight }}>
          {graphPoints.map(point => (
            <GraphMarker
              key={point.timestamp}
              config={config}
              point={point}
              isSelected={selectedPoint?.timestamp === point.timestamp}
              setSelected={setSelectedPoint}
            />
          ))}

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={[0, 0, innerWidth, outerHeight].join(' ')}
            className={styles.svgCss}
            style={{ width: innerWidth, height: outerHeight }}
            ref={svgRef}
          >
            <polyline className={styles.graph} points={points} />
            {graphPoints.map(point => (
              <GraphPoint
                key={point.timestamp}
                point={point}
                isSelectable={true}
                isSelected={selectedPoint?.timestamp === point.timestamp}
                setSelected={point => {
                  if (point.timestamp === selectedPoint?.timestamp) {
                    setSelectedPoint(null);
                  } else {
                    setSelectedPoint(point);
                  }
                }}
                config={config}
              />
            ))}
          </svg>

          <GraphScaleTimes config={config} />

          {latestPoint && config.showCurrentValue && (
            <span
              className={styles.latestVal}
              style={{
                top: valToTop(config, latestPoint.val || 6) - 35,
                left: tsToLeft(config, latestPoint.timestamp) - 13,
                color: timestampIsUnderMaxAge(Date.now(), latestPoint.timestamp, 8) ? '#555' : '#aaa',
              }}
            >
              {setOneDecimal(latestPoint.val)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
