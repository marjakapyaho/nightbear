import { renderFromProps } from 'web/app/utils/react';

export default renderFromProps<{
  value?: number;
  onChange: (newRange: number) => void;
}>(__filename, (React, _props) => <div className="this">TODO</div>);
