export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const STORAGE_KEYS = {
  TOKEN: 'jira_saas_token',
  USER: 'jira_saas_user',
  TENANT: 'jira_saas_tenant',
  UI: 'jira_saas_ui',
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/app/dashboard',
  USERS: '/app/users',
  CLIENTS: '/app/clients',
  PROJECTS: '/app/projects',
  MY_PROJECTS: '/app/my-projects',
  FEATURES: '/app/features',
  TASKS: '/app/tasks',
  MY_TASKS: '/app/my-tasks',
};

export const THEME_COLORS = [
  { id: 'blue', label: 'Ocean', main: '#2563eb' },
  { id: 'teal', label: 'Teal', main: '#0d9488' },
  { id: 'purple', label: 'Violet', main: '#7c3aed' },
  { id: 'indigo', label: 'Indigo', main: '#4f46e5' },
  { id: 'orange', label: 'Amber', main: '#ea580c' },
];
