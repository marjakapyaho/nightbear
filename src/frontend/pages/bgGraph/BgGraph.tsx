import { ScrollNumberSelector } from 'frontend/components/scrollNumberSelector/ScrollNumberSelector';
import { nbBg, nbCarbs, nbInsulin } from 'frontend/utils/colors';
import { StatusBar } from 'frontend/components/statusBar/StatusBar';
import { useState } from 'react';
import React from 'react';
import { getBgGraphBaseConfig, mapTimelineEntriesToGraphPoints } from './bgGraphUtils';
import styles from './BgGraph.module.scss';
import { Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';
import { ScrollableGraph } from 'frontend/components/scrollableGraph/ScrollableGraph';
import { useTimelineEntries } from 'frontend/data/timelineEntries/useTimelineEntries';

export const BgGraph = () => {
  const baseConfig = getBgGraphBaseConfig();
  const { timelineEntries, saveGraphPointData, isLoading, isError, isSuccess } = useTimelineEntries(
    Date.now() - baseConfig.timelineRange,
  );
  const graphPoints = mapTimelineEntriesToGraphPoints(timelineEntries);

  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

  return (
    <div className={styles.bgGraph}>
      <StatusBar graphPoint={graphPoints.length ? graphPoints[graphPoints.length - 1] : null} />

      <div style={{ height: baseConfig.outerHeight }}>
        {isSuccess && (
          <ScrollableGraph
            graphPoints={graphPoints}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            baseConfig={baseConfig}
          />
        )}
        {isLoading && <div className={styles.loading}>Loading...</div>}
        {isError && <div className={styles.error}>Error</div>}
      </div>

      <div className={styles.graphBottom}>
        <ScrollNumberSelector
          value={selectedPoint?.valBottom}
          onChange={newVal => {
            const newPoint = selectedPoint
              ? { ...selectedPoint, valBottom: selectedPoint?.valBottom === newVal ? undefined : newVal }
              : null;
            setSelectedPoint(newPoint);
            newPoint && saveGraphPointData(newPoint);
          }}
          min={5}
          max={100}
          step={5}
          centerOn={40}
          color={nbCarbs}
        />
        <ScrollNumberSelector
          value={selectedPoint?.valMiddle || undefined}
          onChange={newVal => {
            const newPoint = selectedPoint
              ? { ...selectedPoint, valMiddle: selectedPoint.valMiddle === newVal ? undefined : newVal }
              : null;
            setSelectedPoint(newPoint);
            newPoint && saveGraphPointData(newPoint);
          }}
          min={1}
          max={20}
          step={0.5}
          centerOn={8}
          decimals={1}
          color={nbBg}
        />
        <ScrollNumberSelector
          value={selectedPoint?.valTop}
          onChange={newVal => {
            const newPoint = selectedPoint
              ? { ...selectedPoint, valTop: selectedPoint.valTop === newVal ? undefined : newVal }
              : null;
            setSelectedPoint(newPoint);
            newPoint && saveGraphPointData(newPoint);
          }}
          min={1}
          max={20}
          step={1}
          centerOn={5}
          color={nbInsulin}
        />
      </div>
    </div>
  );
};
