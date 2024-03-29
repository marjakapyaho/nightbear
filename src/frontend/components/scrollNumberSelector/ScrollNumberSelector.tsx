import { range } from 'lodash';
import React from 'react';
import { useEffect, useRef } from 'react';
import scrollIntoView from 'scroll-into-view';
import 'frontend/components/scrollNumberSelector/ScrollNumberSelector.scss';

type Props = {
  value?: number;
  onChange: (newRange: number) => void;
  min: number;
  max: number;
  step: number;
  centerOn?: number;
  decimals?: number;
  color: string;
};

export default (props => {
  const selectedEl = useRef<HTMLDivElement | null>(null);
  const animSpeed = useRef(0); // for the first render, scroll instantly, and only after, start the smooth behaviour
  useEffect(() => {
    if (!selectedEl.current) return;
    // In a perfect world, we'd just do: selectedEl.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // But it doesn't work smoothly in Safari: https://caniuse.com/#feat=scrollintoview
    // And even in other browsers, you can't scroll multiple targets simultaneously: https://stackoverflow.com/questions/55562289/how-to-smooth-scroll-two-elements-at-the-same-time-using-scrollintoview
    // So let's just give up and do it in JS ¯\_(ツ)_/¯
    scrollIntoView(selectedEl.current, { time: animSpeed.current });
    if (!animSpeed.current) animSpeed.current = 250;
  }, [props.value]); // note that even though we actually use selectedEl in this effect, it's mutable -> can't use with useEffect(); but props.value is a good enough proxy!

  const options = range(props.min, props.max + props.step, props.step);

  return (
    <div className="nb-ScrollNumberSelector" style={{ background: props.color }}>
      {options.map((val, i) => (
        <div
          key={i}
          style={{ background: props.value === val ? 'white' : '', color: props.value === val ? props.color : '' }}
          ref={val === props.value || (props.value === undefined && val === props.centerOn) ? selectedEl : null}
          onClick={() => props.onChange(val)}
        >
          {val.toFixed(props.decimals)}
        </div>
      ))}
    </div>
  );
}) as React.FC<Props>;
