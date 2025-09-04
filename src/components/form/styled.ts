import { Button, styled, TextField } from '@mui/material';

export const StyledTextField = styled(TextField)({
    input: {
        color: 'white',
    },
    label: {
        color: '#FFE3DC',
    },
    '& .MuiOutlinedInput-root': {
        backgroundColor: '#2f2f2f',
    },
});

export const StyledButton = styled(Button)({
    ':disabled': {
        backgroundColor: '#1f1f1f',
        color: 'white',
    },
});
