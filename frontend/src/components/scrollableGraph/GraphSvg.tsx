import  { useRef } from 'react';
import styles from './ScrollableGraph.module.scss';
import { GraphConfig, mapGraphPointsForPolyline, Point } from './scrollableGraphUtils';
import { GraphPoint } from './GraphPoint';

type Props = {
  graphPoints: Point[];
  selectedPoint: Point | null;
  setSelectedPoint: (point: Point | null) => void;
  config: GraphConfig;
};

export const GraphSvg = ({ graphPoints, selectedPoint, setSelectedPoint, config }: Props) => {
  const { innerWidth, outerHeight } = config;
  const svgRef = useRef<SVGSVGElement | null>(null);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={[0, 0, innerWidth, outerHeight].join(' ')}
      className={styles.svgGraph}
      style={{ width: innerWidth, height: outerHeight }}
      ref={svgRef}
    >
      <polyline className={styles.graphLine} points={mapGraphPointsForPolyline(graphPoints, config)} />
      {graphPoints.map(point => (
        <GraphPoint
          key={point.timestamp}
          point={point}
          isSelected={selectedPoint?.timestamp === point.timestamp}
          setSelected={point => {
            setSelectedPoint(point.timestamp === selectedPoint?.timestamp ? null : point);
          }}
          config={config}
        />
      ))}
    </svg>
  );
};
