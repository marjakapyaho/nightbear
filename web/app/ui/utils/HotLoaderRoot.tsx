import * as React from 'react';
import { hot } from 'react-hot-loader';
import NightbearUi from 'web/app/ui/NightbearUi';

// The only purpose of this component is to wrap the main UI root component with react-hot-loader.
// For whatever reason, the magic won't work if they reside in the same file. :shrug:
export default hot(module)(() => <NightbearUi />);
