'use client';

import React from 'react';
import * as RB from 'react-bootstrap';

type BootstrapWrapperProps = React.PropsWithChildren<Record<string, unknown>>;

// These wrappers intentionally keep prop typing broad so mixed Next.js/React-Bootstrap
// compositions can compile without leaking the library's narrower generic constraints.
export const Button = (props: BootstrapWrapperProps) => <RB.Button {...(props as any)} />;
export const Card = (props: BootstrapWrapperProps) => <RB.Card {...(props as any)} />;
export const CardBody = (props: BootstrapWrapperProps) => <RB.CardBody {...(props as any)} />;
export const CardFooter = (props: BootstrapWrapperProps) => <RB.CardFooter {...(props as any)} />;
export const CardHeader = (props: BootstrapWrapperProps) => <RB.CardHeader {...(props as any)} />;
export const CardTitle = (props: BootstrapWrapperProps) => <RB.CardTitle {...(props as any)} />;
export const Col = (props: BootstrapWrapperProps) => <RB.Col {...(props as any)} />;
export const Row = (props: BootstrapWrapperProps) => <RB.Row {...(props as any)} />;
export const Dropdown = (props: BootstrapWrapperProps) => <RB.Dropdown {...(props as any)} />;
export const DropdownToggle = (props: BootstrapWrapperProps) => <RB.DropdownToggle {...(props as any)} />;
export const DropdownMenu = (props: BootstrapWrapperProps) => <RB.DropdownMenu {...(props as any)} />;
export const DropdownItem = (props: BootstrapWrapperProps) => <RB.DropdownItem {...(props as any)} />;
