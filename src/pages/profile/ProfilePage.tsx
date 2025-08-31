import Loading from '@/components/loading/Loading';
import QRCode from 'react-qr-code';
import { ArrowBack } from '@mui/icons-material';
import { CSSProperties } from 'react';
import { IconButton, Stack, styled } from '@mui/material';
import { authContextAtom } from '@/utils/auth/atoms';
import { getEndpointAddressAtom } from '@/utils/network/atoms';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { useParamAtom } from '@/utils/hooks/useParamAtom';
import Glassy from '@/components/Glassy';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { authUser, isLoading } = useAtomValue(authContextAtom);
    const getEndpointAddr = useParamAtom(
        getEndpointAddressAtom,
        authUser ?? ''
    );

    /* Handle incomplete state */
    const isBusy = isLoading || !authUser;
    if (isBusy) {
        return <Loading />;
    }

    const GlassyContainer = Glassy(Container);

    return (
        <GlassyContainer direction="column">
            <IconButton
                style={backBtnStyle}
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
                    <QRCode
                        value={getEndpointAddr?.data ?? 'INVALID CODE'}
                    ></QRCode>
                </Stack>
            </Stack>

            {/* TODO: Add share button: https://github.com/buildyourwebapp/tauri-plugin-sharesheet */}
        </GlassyContainer>
    );
}

const backBtnStyle: CSSProperties = {
    width: 'fit-content',
    marginBottom: '-3.5em',
    fontSize: 'large',
    color: 'white',
    marginLeft: '-0.5em',
};

const Container = styled(Stack)({
    display: 'flex',
    margin: 0,
    height: '100vh',
    width: '100%',
    padding: '2em',
    gap: '5em',
});
