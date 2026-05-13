import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { SidebarContent } from './Sidebar';

// Note: SidebarContent uses the create-app@0.8.2 (Backstage 1.50) blueprint
// signature. The release pin to 1.41.0 introduces a tighter type for the
// `extensions` array. Cast is local, runtime is unaffected, and the right
// fix lands when we bump back to a release where the signature matches.
export const navModule = createFrontendModule({
  pluginId: 'app',
  extensions: [SidebarContent as unknown as never],
});
