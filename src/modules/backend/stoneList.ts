import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { getStoneFilters, getStoneList, StoneFiltersResponse, StoneItem, StoneListParams } from 'services/backend';

const namespace = 'backend/stoneList';

export interface StoneListFilterState {
  shape?: string;
  colors: string[];
  clarities: string[];
  cut?: string;
  certificates: string[];
  type?: 'natural' | 'lab_grown';
  minCarat?: number;
  maxCarat?: number;
  minBudget?: number;
  maxBudget?: number;
}

interface StoneListState {
  loading: boolean;
  filtersLoading: boolean;
  page: number;
  pageSize: number;
  total: number;
  list: StoneItem[];
  filters: StoneFiltersResponse | null;
  filterValues: StoneListFilterState;
}

const initialState: StoneListState = {
  loading: false,
  filtersLoading: false,
  page: 1,
  pageSize: 20,
  total: 0,
  list: [],
  filters: null,
  filterValues: {
    colors: [],
    clarities: [],
    certificates: [],
  },
};

export const fetchStoneFilters = createAsyncThunk(`${namespace}/fetchStoneFilters`, async () => {
  const data = await getStoneFilters();
  return data;
});

export const fetchStoneList = createAsyncThunk(
  `${namespace}/fetchStoneList`,
  async (_: void, { getState }) => {
    const state = getState() as RootState;
    const { page, pageSize, filterValues } = state.stoneList;
    const params: StoneListParams = {
      page,
      pageSize,
      shape: filterValues.shape,
      color: filterValues.colors,
      clarity: filterValues.clarities,
      cut: filterValues.cut,
      minCarat: filterValues.minCarat,
      maxCarat: filterValues.maxCarat,
      minBudget: filterValues.minBudget,
      maxBudget: filterValues.maxBudget,
      certificate: filterValues.certificates,
      type: filterValues.type,
    };
    const data = await getStoneList(params);
    return data;
  },
);

const stoneListSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    resetStoneListState: () => initialState,
    setFilterValues: (state, action: PayloadAction<Partial<StoneListFilterState>>) => {
      state.filterValues = {
        ...state.filterValues,
        ...action.payload,
      };
      state.page = 1;
    },
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.page = action.payload.page;
      state.pageSize = action.payload.pageSize;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoneFilters.pending, (state) => {
        state.filtersLoading = true;
      })
      .addCase(fetchStoneFilters.fulfilled, (state, action) => {
        state.filtersLoading = false;
        state.filters = action.payload;
      })
      .addCase(fetchStoneFilters.rejected, (state) => {
        state.filtersLoading = false;
      })
      .addCase(fetchStoneList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStoneList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
        state.total = action.payload.meta?.pagination?.total || 0;
        state.page = action.payload.meta?.pagination?.page || state.page;
        state.pageSize = action.payload.meta?.pagination?.pageSize || state.pageSize;
      })
      .addCase(fetchStoneList.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { resetStoneListState, setFilterValues, setPagination } = stoneListSlice.actions;

export const selectStoneList = (state: RootState) => state.stoneList;

export default stoneListSlice.reducer;

