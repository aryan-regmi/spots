import Loading from '@/components/loading/Loading';
import QRCode from 'react-qr-code';
import useGetEndpointAddr from '@/utils/hooks/network/useGetEndpointAddr';
import { ArrowBack } from '@mui/icons-material';
import { IconButton, Stack } from '@mui/material';
import { authContextAtom } from '@/components/auth/Auth';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const { currentUser, isLoading } = useAtomValue(authContextAtom);
    const navigate = useNavigate();
    const getEndpointAddr = useGetEndpointAddr(currentUser ?? '');

    const isBusy = isLoading || !currentUser;

    if (isBusy) {
        return <Loading />;
    }

    return (
        <Stack
            direction="column"
            spacing="5em"
            sx={{ width: '100%' }}
            style={{ padding: '1em' }}
        >
            <IconButton
                id="back-btn"
                size="large"
                onClick={() => navigate(-1)}
                disabled={isBusy}
            >
                <ArrowBack />
            </IconButton>

            <Stack direction="row" justifyContent="center">
                <Stack
                    direction="column"
                    sx={{
                        backgroundColor: 'white',
                        padding: '1em',
                        borderRadius: '1em',
                    }}
                >
                    <QRCode value={getEndpointAddr.data ?? ''}></QRCode>
                </Stack>
            </Stack>

            {/* TODO: Add share button: https://github.com/buildyourwebapp/tauri-plugin-sharesheet */}
        </Stack>
    );
}
