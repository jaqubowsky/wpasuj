import { useImperativeHandle, useLayoutEffect, useRef, type Ref } from "react";

type Field = HTMLInputElement | HTMLTextAreaElement;

function replayTypingFromBeforeHydration(field: Field) {
  const typed = field.value;

  if (typed === field.defaultValue) return;

  const nativeValueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(field), "value")!.set!;

  field.value = field.defaultValue;
  nativeValueSetter.call(field, typed);
  field.dispatchEvent(new Event("input", { bubbles: true }));
}

export function useTypingBeforeHydration<T extends Field>(ref: Ref<T> | undefined) {
  const field = useRef<T>(null);

  useImperativeHandle(ref, () => field.current!, []);
  useLayoutEffect(() => replayTypingFromBeforeHydration(field.current!), []);

  return field;
}
