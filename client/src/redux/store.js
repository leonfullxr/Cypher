import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice'


export const store = configureStore({
  reducer: {
    user: userReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
    store => next => action => {
      console.log('Dispatching:', action);
      return next(action);
    }
  )
});