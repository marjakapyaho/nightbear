import { RollingAnalysisResults } from 'core/analyser/rolling-analysis';
import { Carbs, Insulin, MeterEntry, SensorEntry } from 'core/models/model';
import { isSameModel, last } from 'core/models/utils';
import { css, cx } from 'emotion';
import React, { useEffect, useRef } from 'react';
import TimeAgo from 'web/ui/components/timeAgo/TimeAgo';
import TimelineGraphBg from 'web/ui/components/timeline/TimelineGraphBg';
import TimelineMarkerBg from 'web/ui/components/timeline/TimelineMarkerBg';
import TimelineMarkerCarbs from 'web/ui/components/timeline/TimelineMarkerCarbs';
import TimelineMarkerCursor from 'web/ui/components/timeline/TimelineMarkerCursor';
import TimelineMarkerInsulin from 'web/ui/components/timeline/TimelineMarkerInsulin';
import TimelineMarkerSituation from 'web/ui/components/timeline/TimelineMarkerSituation';
import TimelineScaleBg from 'web/ui/components/timeline/TimelineScaleBg';
import TimelineScaleTs from 'web/ui/components/timeline/TimelineScaleTs';
import { getExtendedTimelineConfig, leftToTs, TimelineConfig } from 'web/ui/components/timeline/utils';

type Props = {
  timelineConfig: TimelineConfig;
  cursorTimestamp?: number | null;
  onCursorTimestampUpdate: (ts: number | null) => void;

  bgModels: (SensorEntry | MeterEntry)[];
  selectedBgModel?: SensorEntry | MeterEntry;
  onBgModelSelect: (model: SensorEntry | MeterEntry) => void;

  insulinModels: Insulin[];
  selectedInsulinModel?: Insulin;
  onInsulinModelSelect: (model: Insulin) => void;

  carbsModels: Carbs[];
  selectedCarbsModel?: Carbs;
  onCarbsModelSelect: (model: Carbs) => void;

  rollingAnalysisResults?: RollingAnalysisResults;
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
  const scrollingRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  useEffect(scrollRightOnMount, []);

  const c = getExtendedTimelineConfig(props.timelineConfig);
  const latestBgModel = props.bgModels.find(last);

  return (
    <div className={rootCss}>
      <div className={baseLayerCss}>
        <TimelineScaleBg timelineConfig={c} />
      </div>
      <div
        className={scrollingLayerCss}
        ref={scrollingRef}
        onClick={event => {
          if (!scrollingRef.current) return;
          if (event.target !== svgRef.current) return;
          props.onCursorTimestampUpdate(leftToTs(c, scrollingRef.current.scrollLeft + event.clientX));
        }}
      >
        <div className={scrollingCutoffCss} style={{ width: c.innerWidth, height: c.outerHeight }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={[0, 0, c.innerWidth, c.outerHeight].join(' ')}
            className={svgCss}
            style={{ width: c.innerWidth, height: c.outerHeight }}
            ref={svgRef}
          >
            <TimelineGraphBg timelineConfig={c} bgModels={props.bgModels} />
            {props.bgModels.map((model, i) => (
              <TimelineMarkerBg
                key={i}
                timelineConfig={c}
                model={model}
                isSelected={isSameModel(props.selectedBgModel, model)}
                onSelect={props.onBgModelSelect}
              />
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
          {props.carbsModels.map((model, i) => (
            <TimelineMarkerCarbs
              key={i}
              timelineConfig={c}
              model={model}
              isSelected={isSameModel(props.selectedCarbsModel, model)}
              onSelect={props.onCarbsModelSelect}
            />
          ))}
          {props.cursorTimestamp ? (
            <TimelineMarkerCursor
              timelineConfig={c}
              timestamp={props.cursorTimestamp}
              onClick={() => props.onCursorTimestampUpdate(null)}
            />
          ) : null}
          {props.rollingAnalysisResults &&
            props.rollingAnalysisResults.map((lane, laneIndex) =>
              lane.map(([situation, startTs, situationDuration]) => (
                <TimelineMarkerSituation
                  key={laneIndex + '-' + startTs}
                  timelineConfig={c}
                  laneIndex={laneIndex}
                  situation={situation}
                  situationStartTs={startTs}
                  situationDuration={situationDuration}
                />
              )),
            )}
        </div>
      </div>
      <span className={css({ position: 'absolute', top: 0, left: 0, background: 'white', padding: 2 })}>
        Last BG update: {latestBgModel ? <TimeAgo ts={latestBgModel.timestamp} frequentUpdates /> : 'n/a'} ago
      </span>
    </div>
  );

  function scrollRightOnMount() {
    if (!scrollingRef.current) return;
    scrollingRef.current.scrollLeft = scrollingRef.current.scrollWidth;
  }
}) as React.FC<Props>;
