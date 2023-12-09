import { ActiveProfile } from 'core/models/model';
import { css, cx } from '@emotion/css';
import React from 'react';
import { ExtendedTimelineConfig, markerStyles, tsToLeft } from 'web/ui/components/timeline/utils';
import { borderColor } from 'web/utils/colors';

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
      borderLeft: `3px dotted ${borderColor}`,
    }),
  ),
};

export default (props => {
  return (
    <div className={styles.root} style={{ left: tsToLeft(props.timelineConfig, props.model.timestamp) }}>
      <div className={styles.verticalLine} />
      <div className={styles.centeringWrapper}>
        <span className={styles.textLabel}>{props.model.profileName.toUpperCase()}</span>
      </div>
    </div>
  );
}) as React.FC<Props>;
