import { Insulin, MeterEntry, SensorEntry } from 'core/models/model';
import { css, cx } from 'emotion';
import React, { useEffect, useRef } from 'react';
import TimelineGraphBg from 'web/ui/utils/timeline/TimelineGraphBg';
import TimelineMarkerBg from 'web/ui/utils/timeline/TimelineMarkerBg';
import TimelineMarkerInsulin from 'web/ui/utils/timeline/TimelineMarkerInsulin';
import TimelineScaleBg from 'web/ui/utils/timeline/TimelineScaleBg';
import TimelineScaleTs from 'web/ui/utils/timeline/TimelineScaleTs';
import { getExtendedTimelineConfig, TimelineConfig } from 'web/ui/utils/timeline/utils';
import { isSameModel } from 'core/models/utils';

type Props = {
  timelineConfig: TimelineConfig;
  bgModels: (SensorEntry | MeterEntry)[];
  insulinModels: Insulin[];
  selectedInsulinModel?: Insulin;
  onInsulinModelSelect: (model: Insulin) => void;
};

const rootCss = css({
  position: 'relative', // a lot of children are positioned according to this root element
  overflow: 'hidden', // if anything pokes out, hide it; scrolling is implemented using a separate element
});
const baseLayerCss = css({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
});
const scrollingLayerCss = cx(
  baseLayerCss,
  css({
    overflowX: 'scroll',
    overflowY: 'hidden',
    // IMPORTANT: Even though this doesn't seem to be needed for momentum scrolling anymore (tested on iOS 13.3),
    // at least SVG elements within a scroll container may randomly skip repaints without it. ¯\_(ツ)_/¯
    WebkitOverflowScrolling: 'touch',
  }),
);
const scrollingCutoffCss = css({
  overflow: 'hidden',
  position: 'relative',
});
const svgCss = css({
  display: 'block',
  zIndex: 9,
});

export default (props => {
  const thisRef = useRef<HTMLDivElement | null>(null);
  useEffect(scrollRightOnMount, []);

  const c = getExtendedTimelineConfig(props.timelineConfig);

  return (
    <div className={rootCss}>
      <div className={baseLayerCss}>
        <TimelineScaleBg timelineConfig={c} />
      </div>
      <div className={scrollingLayerCss} ref={thisRef}>
        <div className={scrollingCutoffCss} style={{ width: c.innerWidth, height: c.outerHeight }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={[0, 0, c.innerWidth, c.outerHeight].join(' ')}
            className={svgCss}
            style={{ width: c.innerWidth, height: c.outerHeight }}
          >
            <TimelineGraphBg timelineConfig={c} bgModels={props.bgModels} />
            {props.bgModels.map((model, i) => (
              <TimelineMarkerBg key={i} timelineConfig={c} model={model} />
            ))}
          </svg>
          <TimelineScaleTs timelineConfig={c} />
          {props.insulinModels.map((model, i) => (
            <TimelineMarkerInsulin
              key={i}
              timelineConfig={c}
              model={model}
              isSelected={isSameModel(props.selectedInsulinModel, model)}
              onSelect={props.onInsulinModelSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );

  function scrollRightOnMount() {
    if (!thisRef.current) return;
    thisRef.current.scrollLeft = thisRef.current.scrollWidth;
  }
}) as React.FC<Props>;
