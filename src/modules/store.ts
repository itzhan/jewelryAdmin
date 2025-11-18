import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';

import global from './global';
import user from './user';
import listBase from './list/base';
import listSelect from './list/select';
import listCard from './list/card';
import stoneList from './backend/stoneList';

const reducer = combineReducers({
  global,
  user,
  listBase,
  listSelect,
  listCard,
  stoneList,
});

export const store = configureStore({
  reducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
