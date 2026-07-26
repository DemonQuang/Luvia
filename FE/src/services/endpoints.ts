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
  }
};
export default endpoints;
