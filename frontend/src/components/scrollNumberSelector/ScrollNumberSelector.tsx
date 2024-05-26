import { range } from 'lodash'
import { useEffect, useRef } from 'react'
import scrollIntoView from 'scroll-into-view'
import styles from './ScrollNumberSelector.module.scss'

type Props = {
  value?: number
  onChange: (newVal: number) => void
  min: number
  max: number
  step: number
  centerOn?: number
  decimals?: number
  color: string
}

export const ScrollNumberSelector = ({
  value,
  onChange,
  min,
  max,
  step,
  centerOn,
  decimals,
  color,
}: Props) => {
  const selectedEl = useRef<HTMLDivElement | null>(null)
  const animSpeed = useRef(0) // for the first render, scroll instantly, and only after, start the smooth behaviour
  useEffect(() => {
    if (!selectedEl.current) return
    // In a perfect world, we'd just do: selectedEl.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // But it doesn't work smoothly in Safari: https://caniuse.com/#feat=scrollintoview
    // And even in other browsers, you can't scroll multiple targets simultaneously: https://stackoverflow.com/questions/55562289/how-to-smooth-scroll-two-elements-at-the-same-time-using-scrollintoview
    // So let's just give up and do it in JS ¯\_(ツ)_/¯
    scrollIntoView(selectedEl.current, { time: animSpeed.current })
    if (!animSpeed.current) animSpeed.current = 250
  }, [value]) // note that even though we actually use selectedEl in this effect, it's mutable -> can't use with useEffect(); but value is a good enough proxy!

  const options = range(min, max + step, step)

  return (
    <div className={styles.nbScrollNumberSelector} style={{ background: color }}>
      {options.map((val, i) => (
        <div
          key={i}
          style={{ background: value === val ? 'white' : '', color: value === val ? color : '' }}
          ref={val === value || (value === undefined && val === centerOn) ? selectedEl : null}
          onClick={() => onChange(val)}
        >
          {val.toFixed(decimals)}
        </div>
      ))}
    </div>
  )
}
