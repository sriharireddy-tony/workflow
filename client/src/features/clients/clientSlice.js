import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '@/services/apiClient';

const initialState = {
  items: [],
  meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
  loading: false,
  error: null,
  clientProjects: [],
  clientProjectsLoading: false,
};

export const fetchClients = createAsyncThunk(
  'clients/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/clients', { params });
      return { items: data.data, meta: data.meta };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createClient = createAsyncThunk('clients/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/clients', payload);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const updateClient = createAsyncThunk(
  'clients/update',
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put(`/clients/${id}`, body);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchClientProjects = createAsyncThunk(
  'clients/fetchProjects',
  async (clientId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/clients/${clientId}/projects`);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearClientProjects(state) {
      state.clientProjects = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.meta = action.payload.meta || state.meta;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const c = action.payload;
        const id = c._id || c.id;
        const idx = state.items.findIndex((x) => (x._id || x.id) === id);
        if (idx >= 0) state.items[idx] = c;
      })
      .addCase(fetchClientProjects.pending, (state) => {
        state.clientProjectsLoading = true;
      })
      .addCase(fetchClientProjects.fulfilled, (state, action) => {
        state.clientProjectsLoading = false;
        state.clientProjects = action.payload;
      })
      .addCase(fetchClientProjects.rejected, (state) => {
        state.clientProjectsLoading = false;
      });
  },
});

export const { clearClientProjects } = clientSlice.actions;
export default clientSlice.reducer;
