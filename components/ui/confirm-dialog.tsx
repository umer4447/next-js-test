import * as React from "react";
import { Dialog, DialogFooter, DialogHeader } from "./dialog";
import { Button } from "./button";

export function useConfirmDialog() {
  const [open, setOpen] = React.useState(false);
  const resolver = React.useRef<((v: boolean) => void) | null>(null);

  const confirm = React.useCallback(() => {
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const onCancel = () => {
    setOpen(false);
    resolver.current?.(false);
  };
  const onConfirm = () => {
    setOpen(false);
    resolver.current?.(true);
  };

  const element = (
    <Dialog open={open} onClose={onCancel}>
      <DialogHeader>Confirm delete</DialogHeader>
      <p className="text-sm opacity-80">This action cannot be undone.</p>
      <DialogFooter>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm}>Delete</Button>
      </DialogFooter>
    </Dialog>
  );

  return { confirm, element } as const;
}


