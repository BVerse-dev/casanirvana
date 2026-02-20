'use client';

import React from 'react';
import * as RB from 'react-bootstrap';

// Create actual wrapper components rather than re-exporting
export const Button = (props: RB.ButtonProps) => <RB.Button {...props} />;
export const Card = (props: React.PropsWithChildren<RB.CardProps>) => <RB.Card {...props} />;
export const CardBody = (props: React.PropsWithChildren<RB.CardProps>) => <RB.CardBody {...props} />;
export const CardFooter = (props: React.PropsWithChildren<RB.CardProps>) => <RB.CardFooter {...props} />;
export const CardHeader = (props: React.PropsWithChildren<RB.CardProps>) => <RB.CardHeader {...props} />;
export const CardTitle = (props: React.PropsWithChildren<any>) => <RB.CardTitle {...props} />;
export const Col = (props: React.PropsWithChildren<RB.ColProps>) => <RB.Col {...props} />;
export const Row = (props: React.PropsWithChildren<RB.RowProps>) => <RB.Row {...props} />;
export const Dropdown = (props: React.PropsWithChildren<RB.DropdownProps>) => <RB.Dropdown {...props} />;
export const DropdownToggle = (props: React.PropsWithChildren<RB.DropdownToggleProps>) => <RB.DropdownToggle {...props} />;
export const DropdownMenu = (props: React.PropsWithChildren<RB.DropdownMenuProps>) => <RB.DropdownMenu {...props} />;
export const DropdownItem = (props: React.PropsWithChildren<RB.DropdownItemProps>) => <RB.DropdownItem {...props} />;
