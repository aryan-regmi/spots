/** Displays validation errors. */
export function ValidationErrors(props: { errors: string[] }) {
  return (
    <>
      {props.errors.length > 0 ? (
        <span
          style={{
            color: 'red',
            'max-width': '20rem',
            padding: 0,
            margin: 0,
            'margin-bottom': '-1em',
            'margin-top': '-1em',
            'align-self': 'center',
          }}
        >
          {props.errors[props.errors.length - 1]}
        </span>
      ) : null}
    </>
  );
}
