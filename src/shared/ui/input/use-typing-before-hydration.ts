import { useImperativeHandle, useLayoutEffect, useRef, type Ref } from "react";

function replayTypingFromBeforeHydration(input: HTMLInputElement) {
  const typed = input.value;
  if (typed === input.defaultValue) return;
  const nativeValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  input.value = input.defaultValue;
  nativeValueSetter.call(input, typed);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

export function useTypingBeforeHydration(ref: Ref<HTMLInputElement> | undefined) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current!, []);
  useLayoutEffect(() => replayTypingFromBeforeHydration(input.current!), []);
  return input;
}
