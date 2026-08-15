export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    adminUsers: '/auth/admin/users',
    deleteUser: (id: string) => `/auth/admin/users/${id}`,
  },
  loves: {
    base: '/loves',
    detail: (id: string) => `/loves/${id}`,
    verifyPin: '/loves/verify-pin',
    pageBySlug: (slug: string) => `/loves/page/${slug}`,
    incrementView: (slug: string) => `/loves/${slug}/view`,
  },
  themeCategories: {
    base: '/theme-categories',
    admin: '/theme-categories/admin',
    adminDetail: (id: string) => `/theme-categories/admin/${id}`,
  },
  occasions: {
    base: '/occasions',
    admin: '/occasions/admin',
    adminDetail: (id: string) => `/occasions/admin/${id}`,
  },
  themes: {
    base: '/themes',
    byKey: (key: string) => `/themes/key/${key}`,
    detail: (id: string) => `/themes/${id}`,
    adminList: '/themes/admin/list',
    admin: '/themes/admin',
    adminDetail: (id: string) => `/themes/admin/${id}`,
  },
  musics: {
    base: '/musics',
    admin: '/musics/admin',
    adminDetail: (id: string) => `/musics/admin/${id}`,
    searchFree: '/musics/admin/search-free',
  },
  admin: {
    dashboardStats: '/admin/dashboard-stats',
    pages: '/admin/pages',
    pageStatus: (id: string) => `/admin/pages/${id}/status`,
    pageDelete: (id: string) => `/admin/pages/${id}`,
  }
};
export default endpoints;
