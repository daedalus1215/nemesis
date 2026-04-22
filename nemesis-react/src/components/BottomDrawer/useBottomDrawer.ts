import { useState, useCallback } from "react";

export const useBottomDrawer = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const toggleDrawer = useCallback(
    (open: boolean) => () => setOpen(open),
    []
  );

  return {
    open,
    handleOpen,
    handleClose,
    toggleDrawer,
  };
};
