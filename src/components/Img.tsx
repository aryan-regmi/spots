export default function Img(props: {
    src?: string;
    alt?: string;
    className?: string;
}) {
    const { src, alt, className } = props;
    return <img src={src} alt={alt} className={`card-img ${className}`} />;
}
