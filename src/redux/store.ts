import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import userReducer from './userSlice';
import liveQuizIdReducer from './liveQuizIdSlice';
import connectedUsersReducer from './connectedUsersSlice';

// 1. Combine your reducers
const rootReducer = combineReducers({
  user: userReducer,
  liveQuizId: liveQuizIdReducer,
  connectedUsers: connectedUsersReducer,
});

// 2. Configure persistence
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user','liveQuizId'], // Only 'user' and liveQuizId will be persisted
  //whitelist: ['user', 'connectedUsers'], // Only 'user' will be persisted///
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 3. Create the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions to avoid console errors
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// export types for useSelector and useDispatch hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;