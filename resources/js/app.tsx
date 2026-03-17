import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

type PageModule = () => Promise<{ default: React.ComponentType }>;

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) => {
    const pages: Record<string, PageModule> = {
      ...import.meta.glob<{ default: React.ComponentType }>('./Pages/**/*.jsx'),
      ...import.meta.glob<{ default: React.ComponentType }>('./Pages/**/*.tsx'),
    };
    const page = pages[`./Pages/${name}.tsx`] ?? pages[`./Pages/${name}.jsx`];
    if (!page) {
      throw new Error(`Page not found: ${name}`);
    }
    return page();
  },
  setup({ el, App, props }) {
    const root = createRoot(el);
    root.render(<App {...props} />);
  },
  progress: {
    color: '#4B5563',
  },
});
