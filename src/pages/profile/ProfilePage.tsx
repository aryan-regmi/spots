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

    return (
        <Container direction="column">
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
        </Container>
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
    flex: '1 0 300px',
    margin: '10px',
    width: '100%',
    justifyContent: 'center',
    padding: '1em',
    paddingTop: '1.75em',
    gap: '5em',
    backgroundColor: 'rgba(30, 34, 45, 0.8)',
    backdropFilter: 'blur(10px)',
    /* background-color: rgba(30, 34, 45, 0.8); */
    /* backdrop-filter: blur(10px); */
});
