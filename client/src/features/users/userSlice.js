import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '@/services/apiClient';

const initialState = {
  items: [],
  meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
  loading: false,
  error: null,
  userProjects: [],
  userProjectsLoading: false,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/users', { params });
      return { items: data.data, meta: data.meta };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createUser = createAsyncThunk('users/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/users', payload);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put(`/users/${id}`, body);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchUserProjects = createAsyncThunk(
  'users/fetchProjects',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/users/${userId}/projects`);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserProjects(state) {
      state.userProjects = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.meta = action.payload.meta || state.meta;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const u = action.payload;
        const id = u._id || u.id;
        const idx = state.items.findIndex((x) => (x._id || x.id) === id);
        if (idx >= 0) state.items[idx] = u;
      })
      .addCase(fetchUserProjects.pending, (state) => {
        state.userProjectsLoading = true;
      })
      .addCase(fetchUserProjects.fulfilled, (state, action) => {
        state.userProjectsLoading = false;
        state.userProjects = action.payload;
      })
      .addCase(fetchUserProjects.rejected, (state) => {
        state.userProjectsLoading = false;
      });
  },
});

export const { clearUserProjects } = userSlice.actions;
export default userSlice.reducer;
