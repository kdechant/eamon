import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const usePLayer = () => {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);
  const genderLabel = useAppSelector((state) => {
    return state.player.gender === 'm' ? "mighty" : "fair";
  })

  return {
    dispatch,
    player,
    genderLabel,
  }
}
