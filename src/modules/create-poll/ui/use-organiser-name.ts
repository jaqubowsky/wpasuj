import { useLastName } from "@/shared/last-name";
import { useState } from "react";

export function useOrganiserName() {
  const lastName = useLastName();
  const [typed, setTyped] = useState<string>();

  return [typed ?? lastName, setTyped] as const;
}
