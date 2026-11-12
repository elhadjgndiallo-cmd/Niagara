import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchMe } from '../api/authApi.js'
import { getStoredToken, setStoredToken } from '../api/axiosInstance.js'

const initialState = {
  user: null,
  accessToken: getStoredToken(),
  status: 'idle',
  error: null,
}

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    if (!getStoredToken()) return null
    return await fetchMe()
  } catch (e) {
    setStoredToken(null)
    return rejectWithValue(e.response?.data?.message || 'Session expirée')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      if (action.payload.accessToken) setStoredToken(action.payload.accessToken)
      state.error = null
    },
    clearAuth(state) {
      state.user = null
      state.accessToken = null
      setStoredToken(null)
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadUser.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload ?? null
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.status = 'failed'
        state.user = null
        state.accessToken = null
        state.error = action.payload || null
      })
  },
})

export const { setCredentials, clearAuth } = authSlice.actions
export default authSlice.reducer
