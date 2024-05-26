import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { getFormattedTs } from './timestampUtils'

type Props = {
  ts: number
  live?: boolean
}

export const Timestamp = ({ ts, live }: Props) => {
  const [formattedTs, setFormattedTs] = useState(getFormattedTs(ts))

  const fullFormattedTs = DateTime.fromMillis(ts).toLocaleString(
    DateTime.DATETIME_FULL_WITH_SECONDS,
  )

  useEffect(() => {
    if (!live) return
    const interval = setInterval(() => setFormattedTs(getFormattedTs(ts, live)), 1000)
    return () => clearInterval(interval)
  }, [ts, live])

  return (
    <span className="nb-Timestamp" title={fullFormattedTs}>
      {formattedTs}
    </span>
  )
}
