import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import uiReducer from '@/features/ui/uiSlice';
import userReducer from '@/features/users/userSlice';
import clientReducer from '@/features/clients/clientSlice';
import projectReducer from '@/features/projects/projectSlice';
import featureReducer from '@/features/features/featureSlice';
import taskReducer from '@/features/tasks/taskSlice';
import dashboardReducer from '@/features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    users: userReducer,
    clients: clientReducer,
    projects: projectReducer,
    features: featureReducer,
    tasks: taskReducer,
    dashboard: dashboardReducer,
  },
});
