import { Situation } from 'core/models/model';
import { css } from 'emotion';
import React from 'react';
import { ExtendedTimelineConfig, timeToWidth, tsToLeft } from 'web/ui/components/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  laneIndex: number;
  situation: Situation;
  situationStartTs: number;
  situationDuration: number;
};

const HEIGHT = 15;

const styles = {
  root: css({
    position: 'absolute',
    height: HEIGHT,
    background: 'orange',
    overflow: 'hidden',
    color: 'white',
    fontFamily: 'SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
    fontSize: 12,
    borderRadius: 8,
    textAlign: 'center',
    padding: '2px 4px',
    '&:hover': {
      height: '100%', // i.e. extend AT LEAST all the way to the bottom
      opacity: 0.5, // make semi-transparent so the relevant timeline entries are visible below us
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
      title={props.situation}
    >
      {props.situation}
    </div>
  );
}) as React.FC<Props>;
