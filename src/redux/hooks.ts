import { useDispatch } from "react-redux";
import type { AppDispatch } from "./store";

export const useAppDispatch: () => AppDispatch = useDispatch;

// kpham: hook to use dispatch with types