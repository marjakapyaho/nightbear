import { ActiveProfile, Carbs, Insulin, MeterEntry, SensorEntry } from 'shared/models/model';
import { isSameModel, lastModel } from 'shared/models/utils';
import React, { useEffect, useRef } from 'react';
import { TimelineGraphBg } from 'frontend/components/timeline/TimelineGraphBg';
import { TimelineMarkerBg } from 'frontend/components/timeline/TimelineMarkerBg';
import { TimelineMarkerCarbs } from 'frontend/components/timeline/TimelineMarkerCarbs';
import { TimelineMarkerInsulin } from 'frontend/components/timeline/TimelineMarkerInsulin';
import { TimelineMarkerCursor } from 'frontend/components/timeline/TimelineMarkerCursor';
import { TimelineMarkerProfileActivation } from 'frontend/components/timeline/TimelineMarkerProfileActivation';
import { TimelineScaleBg } from 'frontend/components/timeline/TimelineScaleBg';
import { TimelineScaleTimes } from 'frontend/components/timeline/TimelineScaleTimes';
import {
  bgToTop,
  getExtendedTimelineConfig,
  leftToTs,
  TimelineConfig,
  tsToLeft,
} from 'frontend/components/timeline/timelineUtils';
import { fontColorDark, fontColorExtraLight } from 'frontend/utils/colors';
import { setOneDecimal } from 'frontend/utils/helpers';
import { timestampIsUnderMaxAge } from 'shared/calculations/calculations';
import styles from './Timeline.module.scss';

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
};

export const Timeline = ({
  timelineConfig,
  cursorTimestamp,
  onCursorTimestampUpdate,
  onBgModelSelect,
  onCarbsModelSelect,
  onInsulinModelSelect,
  carbsModels,
  insulinModels,
  selectedInsulinModel,
  selectedCarbsModel,
  bgModels,
  selectedBgModel,
  profileModels,
}: Props) => {
  const scrollingRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const c = getExtendedTimelineConfig(timelineConfig);
  const latestBgModel = bgModels.find(lastModel);

  useEffect(scrollRightOnMount, []);

  return (
    <div className={styles.timeline}>
      <div className={styles.baseLayerCss}>
        <TimelineScaleBg timelineConfig={c} />
      </div>
      <div
        className={styles.scrollingLayerCss}
        ref={scrollingRef}
        onClick={event => {
          if (!scrollingRef.current) return;
          if (event.target !== svgRef.current) return;
          onCursorTimestampUpdate(leftToTs(c, scrollingRef.current.scrollLeft + event.clientX));
        }}
      >
        <div className={styles.scrollingCutoffCss} style={{ width: c.innerWidth, height: c.outerHeight }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={[0, 0, c.innerWidth, c.outerHeight].join(' ')}
            className={styles.svgCss}
            style={{ width: c.innerWidth, height: c.outerHeight }}
            ref={svgRef}
          >
            <TimelineGraphBg timelineConfig={c} bgModels={bgModels} />
            {bgModels.map((model, i) => (
              <TimelineMarkerBg
                key={i}
                timelineConfig={c}
                model={model}
                isSelected={isSameModel(selectedBgModel, model)}
                onSelect={onBgModelSelect}
              />
            ))}
          </svg>
          <TimelineScaleTimes timelineConfig={c} />
          {insulinModels.map((model, i) => (
            <TimelineMarkerInsulin
              key={i}
              timelineConfig={c}
              model={model}
              isSelected={isSameModel(selectedInsulinModel, model)}
              onSelect={onInsulinModelSelect}
            />
          ))}
          {carbsModels.map((model, i) => (
            <TimelineMarkerCarbs
              key={i}
              timelineConfig={c}
              model={model}
              isSelected={isSameModel(selectedCarbsModel, model)}
              onSelect={onCarbsModelSelect}
            />
          ))}
          {cursorTimestamp ? (
            <TimelineMarkerCursor
              timelineConfig={c}
              timestamp={cursorTimestamp}
              onClick={() => onCursorTimestampUpdate(null)}
            />
          ) : null}
          {profileModels.map((model, i) => (
            <TimelineMarkerProfileActivation key={i} timelineConfig={c} model={model} />
          ))}
          {latestBgModel && (
            <span
              className={styles.latestBg}
              style={{
                top: bgToTop(c, latestBgModel.bloodGlucose || 6) - 35,
                left: tsToLeft(c, latestBgModel.timestamp) - 13,
                color: timestampIsUnderMaxAge(Date.now(), latestBgModel.timestamp, 8)
                  ? fontColorDark
                  : fontColorExtraLight,
              }}
            >
              {setOneDecimal(latestBgModel.bloodGlucose)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  function scrollRightOnMount() {
    if (!scrollingRef.current) return;
    scrollingRef.current.scrollLeft = scrollingRef.current.scrollWidth;
  }
};
