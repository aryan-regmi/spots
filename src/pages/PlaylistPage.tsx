import { useNavigate, useParams } from '@solidjs/router';

export function PlaylistPage() {
  const params = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <h2> {params.id} </h2>

      <button onClick={() => navigate(-1)}>{'Back'}</button>
    </div>
  );
}
