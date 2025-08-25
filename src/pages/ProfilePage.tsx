import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/BackButton';

export function ProfilePage() {
    const navigate = useNavigate();

    // FIXME: Get endpoint QR value from rust
    const value = 'TODO: GET VALUE FROM RUST';

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
                    <QRCode value={value}></QRCode>
                </div>
            </div>
        </div>
    );
}
