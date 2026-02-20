import { type InputHTMLAttributes } from "react";
import {
  FormCheck,
  FormGroup,
  type FormControlProps,
} from "react-bootstrap";
import Feedback from "react-bootstrap/esm/Feedback";
import {
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import type { FormInputProps } from "@/types/component-props";

const CheckFormInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  containerClassName: containerClass,
  control,
  id,
  label,
  noValidate,
  type = "checkbox",
  ...other
}: FormInputProps<TFieldValues> &
  FormControlProps &
  InputHTMLAttributes<HTMLInputElement> & {
    type?: "checkbox" | "switch" | "radio";
  }) => {
  return (
    <Controller<TFieldValues, TName>
      name={name as TName}
      control={control}
      render={({ field, fieldState }) => (
        <FormGroup className={containerClass}>
          <FormCheck
            {...field}
            {...other}
            id={id ?? name}
            label={label}
            type={type}
            checked={field.value}
            isInvalid={Boolean(fieldState.error?.message)}
          />
          {!noValidate && fieldState.error?.message && (
            <Feedback type="invalid">{fieldState.error?.message}</Feedback>
          )}
        </FormGroup>
      )}
    />
  );
};

export default CheckFormInput;
