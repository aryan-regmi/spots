import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div>
            <button type="button" onClick={() => navigate('/')}>
                Back
            </button>
        </div>
    );
}
