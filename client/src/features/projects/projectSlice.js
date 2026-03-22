import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '@/services/apiClient';

const initialState = {
  items: [],
  meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
  loading: false,
  error: null,
  members: [],
  membersLoading: false,
  membersProjectId: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/projects', { params });
      return { items: data.data, meta: data.meta };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createProject = createAsyncThunk('projects/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/projects', payload);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put(`/projects/${id}`, body);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchProjectMembers = createAsyncThunk(
  'projects/fetchMembers',
  async (projectId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/projects/${projectId}/members`);
      return { projectId, members: data.data };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const addProjectMembers = createAsyncThunk(
  'projects/addMembers',
  async ({ projectId, members }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/projects/${projectId}/members`, { members });
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearMembers(state) {
      state.members = [];
      state.membersProjectId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.meta = action.payload.meta || state.meta;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const p = action.payload;
        const id = p._id || p.id;
        const idx = state.items.findIndex((x) => (x._id || x.id) === id);
        if (idx >= 0) state.items[idx] = p;
      })
      .addCase(fetchProjectMembers.pending, (state) => {
        state.membersLoading = true;
      })
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.membersLoading = false;
        state.members = action.payload.members;
        state.membersProjectId = action.payload.projectId;
      })
      .addCase(fetchProjectMembers.rejected, (state) => {
        state.membersLoading = false;
      })
      .addCase(addProjectMembers.fulfilled, (state, action) => {
        const p = action.payload;
        const id = p._id || p.id;
        const idx = state.items.findIndex((x) => (x._id || x.id) === id);
        if (idx >= 0) state.items[idx] = p;
        state.members = p.members || state.members;
      });
  },
});

export const { clearMembers } = projectSlice.actions;
export default projectSlice.reducer;
