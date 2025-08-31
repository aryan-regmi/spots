import Loading from '@/components/loading/Loading';
import QRCode from 'react-qr-code';
import { ArrowBack } from '@mui/icons-material';
import { IconButton, Stack } from '@mui/material';
import { authContextAtom } from '@/utils/auth/atoms';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { getEndpointAddressAtom } from '@/utils/network/atoms';
import { useParamAtom } from '@/utils/hooks/useParamAtom';

export default function ProfilePage() {
    const { authUser, isLoading } = useAtomValue(authContextAtom);
    const navigate = useNavigate();
    const getEndpointAddr = authUser
        ? useParamAtom(getEndpointAddressAtom, authUser)
        : null;

    /* Handle incomplete state */
    const isBusy = isLoading || !authUser;
    if (isBusy) {
        return <Loading />;
    }

    /* const getEndpointAddr = useParamAtom(getEndpointAddressAtom, authUser); */

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
                    <QRCode value={getEndpointAddr?.data ?? ''}></QRCode>
                </Stack>
            </Stack>

            {/* TODO: Add share button: https://github.com/buildyourwebapp/tauri-plugin-sharesheet */}
        </Stack>
    );
}
