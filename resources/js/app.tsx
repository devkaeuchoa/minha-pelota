import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { LocaleProvider } from '@/providers/LocaleProvider';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

type PageModule = () => Promise<{ default: ComponentType }>;

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) => {
    const pages: Record<string, PageModule> = {
      ...import.meta.glob<{ default: ComponentType }>('./Pages/**/*.jsx'),
      ...import.meta.glob<{ default: ComponentType }>('./Pages/**/*.tsx'),
    };
    const page = pages[`./Pages/${name}.tsx`] ?? pages[`./Pages/${name}.jsx`];
    if (!page) {
      throw new Error(`Page not found: ${name}`);
    }
    return page();
  },
  setup({ el, App, props }) {
    const root = createRoot(el);
    const locale = typeof document !== 'undefined' ? document.documentElement?.lang : undefined;
    root.render(
      <LocaleProvider locale={locale}>
        <App {...props} />
      </LocaleProvider>,
    );
  },
  progress: {
    color: '#4B5563',
  },
});
