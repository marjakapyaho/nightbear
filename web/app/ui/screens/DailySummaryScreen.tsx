import { renderFromStore } from 'web/app/utils/react';

export default renderFromStore(
  __filename,
  state => state.timelineData,
  (React, state) => (
    <div className="this">
      {state.status === 'READY' && (
        <table>
          <thead>
            <tr>
              <th>Day</th>
            </tr>
          </thead>
          <tbody>
            {state.models.map((model, i) => (
              <tr key={i}>
                <td>{model.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  ),
);
