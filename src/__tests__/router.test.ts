import { describe, expect, it } from 'vitest';
import routers from 'router';
import { resolve } from 'utils/path';

describe('Admin router configuration', () => {
  it('keeps the login and root redirect routes in place', () => {
    const loginRoute = routers.find((route) => route.path === '/login');
    expect(loginRoute).toBeDefined();
    expect(loginRoute?.isFullPage).toBe(true);
    expect(loginRoute?.meta?.hidden).toBe(true);

    const rootRoute = routers.find((route) => route.path === '/');
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.redirect).toBe('/stone-manage/stones');
  });

  it('resolves joined paths without duplicating slashes', () => {
    expect(resolve('/a', 'b')).toBe('/a/b');
    expect(resolve('/a/', 'b')).toBe('/a/b');
    expect(resolve('/a', '/b')).toBe('/a/b');
    expect(resolve('/a/', '/b/')).toBe('/a/b/');
  });
});
