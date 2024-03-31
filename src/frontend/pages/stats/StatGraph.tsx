import React from 'react';
import { DAY_IN_MS } from 'shared/calculations/calculations';
import { ScrollableGraph } from 'frontend/components/scrollableGraph/ScrollableGraph';
import styles from './Stats.module.scss';
import { BaseGraphConfig, Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';

type Props = {
  label: string;
  points: Point[];
  daysToShow: number;
  valMin: number;
  valMax: number;
  valStep: number;
};

export const StatGraph = ({ label, points, daysToShow, valMin, valMax, valStep }: Props) => {
  const baseConfig: BaseGraphConfig = {
    timelineRange: daysToShow * DAY_IN_MS,
    timelineRangeEnd: Date.now(),
    paddingTop: 35,
    paddingBottom: 40,
    paddingLeft: 30,
    paddingRight: 35,
    outerHeight: 200,
    valMin,
    valMax,
    valStep,
    timeStep: DAY_IN_MS,
    pixelsPerTimeStep: 9,
    showTarget: false,
    showCurrentValue: false,
    timeFormat: 'dd',
    showEveryNthTimeLabel: 3,
  };

  return (
    <div className={styles.statGraph}>
      <div className={styles.graphHeading}>{label}</div>
      <ScrollableGraph graphPoints={points} baseConfig={baseConfig} />
    </div>
  );
};
