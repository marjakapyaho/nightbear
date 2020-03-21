import { ActiveProfile } from 'core/models/model';
import { css, cx } from 'emotion';
import React from 'react';
import { ExtendedTimelineConfig, markerStyles, tsToLeft } from 'web/ui/components/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: ActiveProfile;
};

const styles = {
  ...markerStyles,
  verticalLine: cx(
    markerStyles.verticalLine,
    css({
      width: 0,
      borderLeft: '3px dotted blue',
    }),
  ),
};

export default (props => {
  console.log(props.model);
  return (
    <div className={styles.root} style={{ left: tsToLeft(props.timelineConfig, props.model.timestamp) }}>
      <div className={styles.verticalLine} />
      <div className={styles.centeringWrapper}>
        <span className={styles.textLabel}>{props.model.profileName}</span>
      </div>
    </div>
  );
}) as React.FC<Props>;
