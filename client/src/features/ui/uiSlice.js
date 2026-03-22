import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS, THEME_COLORS } from '@/constants';
import { loadJson, saveJson } from '@/utils/storage';

const defaultUi = {
  primaryColorId: THEME_COLORS[0].id,
  mode: 'light',
  sidebarOpen: true,
};

const persisted = loadJson(STORAGE_KEYS.UI, defaultUi);
const validModes = ['light', 'dark', 'auto'];

const initialState = {
  ...defaultUi,
  ...persisted,
  primaryColorId: persisted?.primaryColorId || defaultUi.primaryColorId,
  mode: validModes.includes(persisted?.mode) ? persisted.mode : defaultUi.mode,
  sidebarOpen: typeof persisted?.sidebarOpen === 'boolean' ? persisted.sidebarOpen : defaultUi.sidebarOpen,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPrimaryColorId(state, action) {
      state.primaryColorId = action.payload;
      saveJson(STORAGE_KEYS.UI, {
        primaryColorId: state.primaryColorId,
        mode: state.mode,
        sidebarOpen: state.sidebarOpen,
      });
    },
    setMode(state, action) {
      state.mode = action.payload;
      saveJson(STORAGE_KEYS.UI, {
        primaryColorId: state.primaryColorId,
        mode: state.mode,
        sidebarOpen: state.sidebarOpen,
      });
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
      saveJson(STORAGE_KEYS.UI, {
        primaryColorId: state.primaryColorId,
        mode: state.mode,
        sidebarOpen: state.sidebarOpen,
      });
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
      saveJson(STORAGE_KEYS.UI, {
        primaryColorId: state.primaryColorId,
        mode: state.mode,
        sidebarOpen: state.sidebarOpen,
      });
    },
  },
});

export const { setPrimaryColorId, setMode, setSidebarOpen, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
