import { Situation } from 'core/models/model';
import { css } from '@emotion/css';
import React from 'react';
import { ExtendedTimelineConfig, timeToWidth, tsToLeft } from 'web/ui/components/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  laneIndex: number;
  situation: Situation;
  situationStartTs: number;
  situationDuration: number;
};

const HEIGHT = 20;

const styles = {
  root: css({
    position: 'absolute',
    height: HEIGHT,
    background: '#ffe358',
    color: '#b1a21e',
    fontFamily: 'SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
    fontSize: 10,
    borderRadius: 8,
    textAlign: 'center',
    cursor: 'pointer',
    padding: '5px 4px',
    '&:hover': {
      height: '100%', // i.e. extend AT LEAST all the way to the bottom
      opacity: 0.5, // make semi-transparent so the relevant timeline entries are visible below us
      color: 'black',
    },
  }),
};

export default (props => {
  return (
    <div
      className={styles.root}
      style={{
        top: props.timelineConfig.paddingTop + props.laneIndex * HEIGHT,
        left: tsToLeft(props.timelineConfig, props.situationStartTs),
        width: timeToWidth(props.timelineConfig, props.situationDuration),
      }}
      onClick={() =>
        console.debug('Situation', [
          props.situation,
          new Date(props.situationStartTs).toISOString(),
          new Date(props.situationStartTs + props.situationDuration).toISOString(),
        ])
      }
    >
      {props.situation}
    </div>
  );
}) as React.FC<Props>;
