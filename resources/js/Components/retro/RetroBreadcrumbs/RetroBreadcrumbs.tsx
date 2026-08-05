import { Link } from '@inertiajs/react';
import styles from './RetroBreadcrumbs.module.css';

export interface RetroBreadcrumbItem {
  label: string;
  href?: string;
}

interface RetroBreadcrumbsProps {
  items: RetroBreadcrumbItem[];
}

export function RetroBreadcrumbs({ items }: RetroBreadcrumbsProps) {
  if (items.length === 0) return null;

  const current = items[items.length - 1];
  const parent = items.length >= 2 ? items[items.length - 2] : null;

  return (
    <nav data-component="retro-breadcrumbs" aria-label="breadcrumb" className={styles.breadcrumbs}>
      {/* Mobile (<640px): single-level back link to the parent, app-nav-bar style */}
      <div className={styles.mobileTrail}>
        {parent ? (
          <Link href={parent.href ?? '#'} className={styles.backLink}>
            <span aria-hidden="true">‹</span> {parent.label}
          </Link>
        ) : (
          <span className={styles.current}>{current.label}</span>
        )}
      </div>

      {/* Desktop (>=640px): full trail */}
      <ol className={styles.desktopTrail}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className={styles.crumb}>
              {!isLast && item.href ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? styles.current : styles.link}>{item.label}</span>
              )}
              {!isLast && (
                <span aria-hidden="true" className={styles.separator}>
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
