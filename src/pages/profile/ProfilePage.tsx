import Loading from '@/components/loading/Loading';
import QRCode from 'react-qr-code';
import useTransitionNavigate from '@/utils/hooks/useTransitionNavigate';
import { ArrowBack } from '@mui/icons-material';
import { CSSProperties } from 'react';
import { IconButton, Stack, styled } from '@mui/material';
import { authContextAtom } from '@/utils/auth/atoms';
import { getEndpointAddressAtom } from '@/utils/network/atoms';
import { useAtomValue } from 'jotai';
import { useParamAtom } from '@/utils/hooks/useParamAtom';

export default function ProfilePage() {
    const transitionNavigate = useTransitionNavigate();
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
                onClick={() => {
                    /* if (document.startViewTransition) { */
                    /*     document.startViewTransition(() => { */
                    /*         navigate(-1); */
                    /*     }); */
                    /* } else { */
                    /*     navigate(-1); */
                    /* } */
                    transitionNavigate(-1);
                }}
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
    height: '100vh',
    width: '100%',
    margin: 0,
    padding: '2em',
    gap: '5em',
    boxSizing: 'border-box',
});
