import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '@/services/apiClient';

const initialState = {
  items: [],
  meta: { total: 0, page: 1, limit: 50, totalPages: 1 },
  loading: false,
  error: null,
  byProject: [],
  byProjectLoading: false,
  selectedProjectId: null,
};

export const fetchFeatures = createAsyncThunk(
  'features/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/features', { params });
      return { items: data.data, meta: data.meta };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchFeaturesByProject = createAsyncThunk(
  'features/fetchByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/projects/${projectId}/features`);
      return { projectId, items: data.data };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createFeature = createAsyncThunk('features/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/features', payload);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const updateFeature = createAsyncThunk(
  'features/update',
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put(`/features/${id}`, body);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const assignFeatureUsers = createAsyncThunk(
  'features/assign',
  async ({ featureId, userIds }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/features/${featureId}/assign`, { userIds });
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const featureSlice = createSlice({
  name: 'features',
  initialState,
  reducers: {
    clearByProject(state) {
      state.byProject = [];
      state.selectedProjectId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeatures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeatures.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.meta = action.payload.meta || state.meta;
      })
      .addCase(fetchFeatures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeaturesByProject.pending, (state) => {
        state.byProjectLoading = true;
      })
      .addCase(fetchFeaturesByProject.fulfilled, (state, action) => {
        state.byProjectLoading = false;
        state.byProject = action.payload.items;
        state.selectedProjectId = action.payload.projectId;
      })
      .addCase(fetchFeaturesByProject.rejected, (state) => {
        state.byProjectLoading = false;
      })
      .addCase(createFeature.fulfilled, (state, action) => {
        const f = action.payload;
        state.items.unshift(f);
        if (state.selectedProjectId && f.projectId === state.selectedProjectId) {
          state.byProject.unshift(f);
        }
      })
      .addCase(updateFeature.fulfilled, (state, action) => {
        const f = action.payload;
        const id = f._id || f.id;
        const idx = state.byProject.findIndex((x) => String(x._id || x.id) === String(id));
        if (idx >= 0) state.byProject[idx] = f;
        const idx2 = state.items.findIndex((x) => String(x._id || x.id) === String(id));
        if (idx2 >= 0) state.items[idx2] = f;
      })
      .addCase(assignFeatureUsers.fulfilled, (state, action) => {
        const f = action.payload;
        const id = f._id || f.id;
        const idx = state.byProject.findIndex((x) => (x._id || x.id) === id);
        if (idx >= 0) state.byProject[idx] = f;
        const idx2 = state.items.findIndex((x) => (x._id || x.id) === id);
        if (idx2 >= 0) state.items[idx2] = f;
      });
  },
});

export const { clearByProject } = featureSlice.actions;
export default featureSlice.reducer;
