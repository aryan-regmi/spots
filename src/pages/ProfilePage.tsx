import { ArrowBack, KeyboardBackspace } from '@mui/icons-material';
import { AppBar, IconButton, Toolbar } from '@mui/material';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
    const navigate = useNavigate();

    // FIXME: Get endpoint QR value from rust
    const value = 'TODO: GET VALUE FROM RUST';

    const backBtn = (
        <Toolbar>
            <IconButton
                style={{ color: 'white', padding: 0 }}
                onClick={() => navigate(-1)}
            >
                <ArrowBack />
            </IconButton>
        </Toolbar>
    );

    return (
        <div>
            {backBtn}
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
