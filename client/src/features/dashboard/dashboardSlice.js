import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '@/services/apiClient';

const initialState = {
  clientsTotal: 0,
  projectsTotal: 0,
  usersTotal: 0,
  tasksByStatus: {},
  tasksSampleTotal: 0,
  /** @type {{ clientId: string|null, clientName: string, clientCode?: string|null, synthetic?: boolean, projects: { projectId: string, name: string, key: string, employees: string[] }[] }[]} */
  hierarchyTree: [],
  loading: false,
  error: null,
};

function memberDisplayName(m, userMap) {
  if (m.userId && typeof m.userId === 'object' && (m.userId.firstName || m.userId.lastName || m.userId.email)) {
    const n = `${m.userId.firstName || ''} ${m.userId.lastName || ''}`.trim();
    return n || m.userId.email || 'User';
  }
  const id = String(m.userId?._id || m.userId);
  return userMap.get(id) || 'Team member';
}

function buildHierarchyTree(clients, projects, usersList, canClients) {
  const userMap = new Map(
    (usersList || []).map((u) => {
      const id = String(u._id || u.id);
      const n = `${u.firstName || ''} ${u.lastName || ''}`.trim();
      return [id, n || u.email || 'User'];
    })
  );

  const projectRows = (proj) => ({
    projectId: String(proj._id),
    name: proj.name,
    key: proj.key,
    employees: [...new Set((proj.members || []).map((m) => memberDisplayName(m, userMap)))],
  });

  if (canClients) {
    if (clients.length) {
      return clients.map((c) => ({
        clientId: String(c._id),
        clientName: c.name,
        clientCode: c.code,
        projects: projects.filter((p) => String(p.clientId) === String(c._id)).map(projectRows),
      }));
    }
    if (projects.length) {
      return [
        {
          clientId: null,
          clientName: 'Projects',
          clientCode: null,
          synthetic: true,
          projects: projects.map(projectRows),
        },
      ];
    }
    return [];
  }

  return [
    {
      clientId: null,
      clientName: 'Your projects',
      clientCode: null,
      synthetic: true,
      projects: projects.map(projectRows),
    },
  ];
}

export const loadDashboardStats = createAsyncThunk(
  'dashboard/load',
  async (_, { getState, rejectWithValue }) => {
    const role = getState().auth.user?.role;
    const canClients = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(role);
    const canUsers = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(role);
    try {
      const emptyList = { data: { data: [], meta: { total: 0 } } };
      const [cList, pList, uList, t] = await Promise.all([
        canClients
          ? apiClient.get('/clients', { params: { page: 1, limit: 100 } })
          : Promise.resolve(emptyList),
        apiClient.get('/projects', { params: { page: 1, limit: 200 } }),
        canUsers ? apiClient.get('/users', { params: { page: 1, limit: 500 } }) : Promise.resolve({ data: { data: [], meta: { total: 0 } } }),
        apiClient.get('/tasks', { params: { page: 1, limit: 500 } }),
      ]);

      const taskItems = t.data.data || [];
      const tasksByStatus = taskItems.reduce((acc, row) => {
        const s = row.status || 'UNKNOWN';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});

      const clients = cList.data.data || [];
      const projects = pList.data.data || [];
      const users = uList.data.data || [];

      const hierarchyTree = buildHierarchyTree(clients, projects, users, canClients);

      return {
        clientsTotal: cList.data.meta?.total ?? 0,
        projectsTotal: pList.data.meta?.total ?? 0,
        usersTotal: uList.data.meta?.total ?? 0,
        tasksByStatus,
        tasksSampleTotal: taskItems.length,
        hierarchyTree,
      };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(loadDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
