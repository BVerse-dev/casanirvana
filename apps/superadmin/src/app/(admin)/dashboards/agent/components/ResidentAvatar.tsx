import Image from "next/image";

type ResidentAvatarProps = { name: string; src?: string | null; size?: number };

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "R";

const ResidentAvatar = ({ name, src, size = 40 }: ResidentAvatarProps) => {
  if (src) {
    return <Image src={src} alt={`${name} profile`} className="rounded-circle object-fit-cover" width={size} height={size} />;
  }

  return (
    <span
      className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
      style={{ width: size, height: size }}
      aria-label={`${name} profile initials`}
    >
      {initials(name)}
    </span>
  );
};

export default ResidentAvatar;
