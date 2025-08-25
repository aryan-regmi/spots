import { useNavigate } from 'react-router-dom';

export function BackButton() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '1em' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
                ← Back
            </button>
        </div>
    );
}
