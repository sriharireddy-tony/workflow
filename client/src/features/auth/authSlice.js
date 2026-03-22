import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '@/services/apiClient';
import { STORAGE_KEYS } from '@/constants';
import { loadJson, removeKey, saveJson } from '@/utils/storage';

const initialState = {
  token: null,
  user: null,
  tenant: null,
  hydrated: false,
  status: 'idle',
  error: null,
};

export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const user = loadJson(STORAGE_KEYS.USER);
  const tenant = loadJson(STORAGE_KEYS.TENANT);
  return { token, user, tenant };
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/auth/login', payload);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/auth/register', payload);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

/** Loads tenant + user from API (e.g. after refresh when localStorage has no tenant). */
export const fetchSession = createAsyncThunk('auth/fetchSession', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/auth/session');
    return data.data;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

function persistSession({ token, user, tenant }) {
  if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  else removeKey(STORAGE_KEYS.TOKEN);
  if (user) saveJson(STORAGE_KEYS.USER, user);
  else removeKey(STORAGE_KEYS.USER);
  if (tenant) saveJson(STORAGE_KEYS.TENANT, tenant);
  else removeKey(STORAGE_KEYS.TENANT);
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.tenant = null;
      state.status = 'idle';
      state.error = null;
      persistSession({ token: null, user: null, tenant: null });
    },
    updateStoredUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      saveJson(STORAGE_KEYS.USER, state.user);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.hydrated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.hydrated = true;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.tenant = action.payload.tenant ?? null;
        persistSession({
          token: action.payload.token,
          user: action.payload.user,
          tenant: action.payload.tenant ?? null,
        });
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
        persistSession({
          token: action.payload.token,
          user: action.payload.user,
          tenant: action.payload.tenant,
        });
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Registration failed';
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
        persistSession({
          token: state.token,
          user: action.payload.user,
          tenant: action.payload.tenant,
        });
      });
  },
});

export const { logout, updateStoredUser } = authSlice.actions;
export default authSlice.reducer;
