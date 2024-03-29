import { RollingAnalysisResults } from 'shared/analyser/rolling-analysis';
import { ActiveProfile, Carbs, Insulin, MeterEntry, SensorEntry } from 'shared/models/model';
import { isSameModel, lastModel } from 'shared/models/utils';
import { css, cx } from '@emotion/css';
import React, { useEffect, useRef } from 'react';
import TimelineGraphBg from 'frontend/components/timeline/TimelineGraphBg';
import TimelineMarkerBg from 'frontend/components/timeline/TimelineMarkerBg';
import TimelineMarkerCarbs from 'frontend/components/timeline/TimelineMarkerCarbs';
import TimelineMarkerCursor from 'frontend/components/timeline/TimelineMarkerCursor';
import TimelineMarkerInsulin from 'frontend/components/timeline/TimelineMarkerInsulin';
import TimelineMarkerProfileActivation from 'frontend/components/timeline/TimelineMarkerProfileActivation';
import TimelineMarkerSituation from 'frontend/components/timeline/TimelineMarkerSituation';
import TimelineScaleBg from 'frontend/components/timeline/TimelineScaleBg';
import TimelineScaleTs from 'frontend/components/timeline/TimelineScaleTs';
import {
  bgToTop,
  getExtendedTimelineConfig,
  leftToTs,
  TimelineConfig,
  tsToLeft,
} from 'frontend/components/timeline/utils';
import { fontColorDark, fontColorExtraLight, fontColorLight } from 'frontend/utils/colors';
import { fontSizeSmall } from 'frontend/utils/config';
import { setOneDecimal } from 'frontend/utils/helpers';
import { timestampIsUnderMaxAge } from 'shared/calculations/calculations';

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

  profileModels: ActiveProfile[];

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
  const latestBgModel = props.bgModels.find(lastModel);

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
          {props.profileModels.map((model, i) => (
            <TimelineMarkerProfileActivation key={i} timelineConfig={c} model={model} />
          ))}
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
          {latestBgModel && (
            <span
              className={css({
                position: 'absolute',
                top: bgToTop(c, latestBgModel.bloodGlucose || 6) - 35,
                left: tsToLeft(c, latestBgModel.timestamp) - 13,
                fontSize: 20,
                zIndex: 100,
                pointerEvents: 'none',
                color: timestampIsUnderMaxAge(Date.now(), latestBgModel.timestamp, 8)
                  ? fontColorDark
                  : fontColorExtraLight,
              })}
            >
              {setOneDecimal(latestBgModel.bloodGlucose)}
            </span>
          )}
        </div>
      </div>
      <span
        className={css({
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'white',
          color: fontColorLight,
          fontSize: fontSizeSmall,
          padding: 4,
        })}
      ></span>
    </div>
  );

  function scrollRightOnMount() {
    if (!scrollingRef.current) return;
    scrollingRef.current.scrollLeft = scrollingRef.current.scrollWidth;
  }
}) as React.FC<Props>;
