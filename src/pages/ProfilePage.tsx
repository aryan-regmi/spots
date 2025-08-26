import QRCode from 'react-qr-code';
import { BackButton } from '../components/BackButton';
import { useGetEndpointAddr } from '../hooks/useNetwork';
import { LoadingPage } from './LoadingPage';
import useAuth from '../hooks/useAuth';

export function ProfilePage() {
    const { currentUser, isLoading } = useAuth();
    const { data: endpointAddr } = useGetEndpointAddr(currentUser ?? '');

    if (!currentUser || isLoading) {
        return <LoadingPage />;
    }

    return (
        <div>
            <BackButton />
            <div className="col" style={{ padding: '1em' }}>
                <div
                    className="row"
                    style={{
                        background: 'white',
                        padding: '1em',
                        borderRadius: '1em',
                    }}
                >
                    <QRCode value={endpointAddr ?? ''}></QRCode>
                </div>
            </div>
        </div>
    );
}
