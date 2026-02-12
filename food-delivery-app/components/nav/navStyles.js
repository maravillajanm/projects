// navStyles.js
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

export const StyledAppBar = styled(AppBar)({
  backgroundColor: 'white',
  boxShadow: 3
});

export const NavContainer = styled(Box)({
  margin: '0 auto',
  width: '80%',
  maxWidth: '1400px',
});

export const LogoContainer = styled(Box)({
  display: 'flex',
  flexGrow: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const MenuContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const IconsContainer = styled(Box)({
  display: 'flex',
  flexGrow: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const IconButtonStyled = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(1),
  backgroundColor: '#e60000',
  color: 'white',
  '&:hover': {
    backgroundColor: '#e60000',
    color: 'white',
  },
}));

export const ReservationButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
  backgroundColor: '#e60000',
  color: 'white',
  borderRadius: '22px',
  '&:hover': {
    backgroundColor: '#e60000',
    color: 'white',
  },
}));

export const DrawerContent = styled(Box)({
  width: 180,
});

export const CartDrawerContent = styled(Box)({
  width: 250,
});