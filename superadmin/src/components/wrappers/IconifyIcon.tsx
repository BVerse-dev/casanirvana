"use client";
import { Icon, type IconProps } from "@iconify/react";

type IconifyIconProps = IconProps & {
  size?: number | string;
};

const IconifyIcon = ({ size, ...props }: IconifyIconProps) => {
  const normalizedSize = typeof size === "number" ? `${size}px` : size;

  return <Icon {...props} height={normalizedSize ?? props.height} width={normalizedSize ?? props.width} />;
};

export default IconifyIcon;
