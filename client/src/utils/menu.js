import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { ROUTES, ROLES } from '@/constants';

export function getNavItems(role) {
  const dash = { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: DashboardRoundedIcon };

  if (role === ROLES.SUPER_ADMIN) {
    return [
      dash,
      { label: 'Users', path: ROUTES.USERS, icon: PeopleAltRoundedIcon },
      { label: 'Clients', path: ROUTES.CLIENTS, icon: BusinessRoundedIcon },
      { label: 'Projects', path: ROUTES.PROJECTS, icon: FolderRoundedIcon },
      { label: 'Features', path: ROUTES.FEATURES, icon: ViewKanbanRoundedIcon },
      { label: 'Tasks', path: ROUTES.TASKS, icon: TaskAltRoundedIcon },
    ];
  }
  if (role === ROLES.ADMIN) {
    return [
      dash,
      { label: 'Clients', path: ROUTES.CLIENTS, icon: BusinessRoundedIcon },
      { label: 'Projects', path: ROUTES.PROJECTS, icon: FolderRoundedIcon },
      { label: 'Features', path: ROUTES.FEATURES, icon: ViewKanbanRoundedIcon },
      { label: 'Tasks', path: ROUTES.TASKS, icon: TaskAltRoundedIcon },
      { label: 'Users', path: ROUTES.USERS, icon: PeopleAltRoundedIcon },
    ];
  }
  if (role === ROLES.MANAGER) {
    return [
      dash,
      { label: 'Projects', path: ROUTES.PROJECTS, icon: FolderRoundedIcon },
      { label: 'Features', path: ROUTES.FEATURES, icon: ViewKanbanRoundedIcon },
      { label: 'Tasks', path: ROUTES.TASKS, icon: TaskAltRoundedIcon },
    ];
  }
  if (role === ROLES.EMPLOYEE) {
    return [
      dash,
      { label: 'My Tasks', path: ROUTES.MY_TASKS, icon: TaskAltRoundedIcon },
      { label: 'My Projects', path: ROUTES.MY_PROJECTS, icon: FolderRoundedIcon },
      { label: 'My Features', path: ROUTES.FEATURES, icon: ViewKanbanRoundedIcon },
    ];
  }
  return [dash];
}
