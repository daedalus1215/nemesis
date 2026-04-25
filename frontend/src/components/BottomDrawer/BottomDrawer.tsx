import { Drawer, PaperProps } from "@mui/material";

type BottomDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  PaperProps?: PaperProps;
};

export const BottomDrawer: React.FC<BottomDrawerProps> = ({ open, onClose, children, PaperProps }) => (
  <Drawer
    anchor="bottom"
    open={open}
    onClose={() => onClose()}
    PaperProps={PaperProps}
  >
    {/* ...Box, IconButton, etc. */}
    {children}
  </Drawer>
);
