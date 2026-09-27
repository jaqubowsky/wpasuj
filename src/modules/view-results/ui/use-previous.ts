import { useState } from "react";

export function usePrevious<Value>(value: Value) {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState<Value>();
  if (current !== value) {
    setPrevious(current);
    setCurrent(value);
  }
  return previous;
}
