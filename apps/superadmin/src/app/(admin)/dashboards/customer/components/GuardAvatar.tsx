import Image from "next/image";

type GuardAvatarProps = {
  name: string;
  src?: string | null;
  size?: number;
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "G";

const GuardAvatar = ({ name, src, size = 40 }: GuardAvatarProps) => {
  if (src) {
    return <Image src={src} alt={`${name} profile`} className="rounded-circle object-fit-cover" width={size} height={size} />;
  }

  return (
    <span
      aria-label={`${name} profile initials`}
      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary fw-semibold"
      style={{ width: size, height: size, flex: `0 0 ${size}px` }}
    >
      {getInitials(name)}
    </span>
  );
};

export default GuardAvatar;
