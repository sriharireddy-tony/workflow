import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '@/services/apiClient';

const initialState = {
  items: [],
  meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
  loading: false,
  error: null,
  detail: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/tasks', { params });
      return { items: data.data, meta: data.meta };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchTasksByProject = createAsyncThunk(
  'tasks/fetchByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/projects/${projectId}/tasks`);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchTasksByUser = createAsyncThunk(
  'tasks/fetchByUser',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/users/${userId}/tasks`);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createTask = createAsyncThunk('tasks/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/tasks', payload);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put(`/tasks/${id}`, body);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const addTaskComment = createAsyncThunk(
  'tasks/addComment',
  async ({ id, message }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/tasks/${id}/comments`, { message });
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/tasks/${id}`);
    return id;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearDetail(state) {
      state.detail = null;
    },
    setDetail(state, action) {
      state.detail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.meta = action.payload.meta || state.meta;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const t = action.payload;
        const id = t._id || t.id;
        const idx = state.items.findIndex((x) => (x._id || x.id) === id);
        if (idx >= 0) state.items[idx] = t;
        if (state.detail && (state.detail._id || state.detail.id) === id) {
          state.detail = t;
        }
      })
      .addCase(addTaskComment.fulfilled, (state, action) => {
        const t = action.payload;
        const id = t._id || t.id;
        const idx = state.items.findIndex((x) => (x._id || x.id) === id);
        if (idx >= 0) state.items[idx] = t;
        if (state.detail && (state.detail._id || state.detail.id) === id) {
          state.detail = t;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((x) => (x._id || x.id) !== id);
        if (state.detail && (state.detail._id || state.detail.id) === id) {
          state.detail = null;
        }
      });
  },
});

export const { clearDetail, setDetail } = taskSlice.actions;
export default taskSlice.reducer;
