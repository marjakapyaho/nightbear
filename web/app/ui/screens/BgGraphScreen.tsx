import { renderFromStore } from 'web/app/utils/react';

export default renderFromStore(
  __filename,
  state => state,
  React => <div className="this">TODO</div>,
);
