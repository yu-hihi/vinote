interface Props {
  className?: string;
  style?: React.CSSProperties;
}

export default function VinoteLogo({ className = "", style }: Props) {
  return (
    <img
      src="/vinote-logo.png"
      alt="Vinote"
      className={className}
      style={{ mixBlendMode: "multiply", ...style }}
    />
  );
}
