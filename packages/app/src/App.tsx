import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';

// Same downgrade-induced type drift as in modules/nav/index.ts — kept as
// a narrow local cast until the release pin and create-app scaffold agree.
export default createApp({
  features: [catalogPlugin as unknown as never, navModule],
});
