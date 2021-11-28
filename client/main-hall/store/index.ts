import { configureStore } from '@reduxjs/toolkit';

import playerReducer from './player';
// import authReducer from './auth';


const store = configureStore({
  reducer: { player: playerReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['player/setPlayer'],
        // Ignore these paths in the state
        ignoredPaths: ['player'],
      },
    }),
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
