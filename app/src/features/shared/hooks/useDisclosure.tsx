import { useCallback, useState } from "react";

/**
Hook for å styre om noe vises eller skjules – som en modal, endringspanel eller annet.

```tsx
const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
```
*/
export function useDisclosure(defaultOpen = false) {
  const [isOpen, setOpen] = useState(defaultOpen);
  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  const onToggle = useCallback(() => setOpen((prev) => !prev), []);
  return { isOpen, onOpen, onClose, onToggle };
}
