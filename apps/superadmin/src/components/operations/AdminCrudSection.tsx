"use client";

import { Fragment, useMemo, useState } from "react";
import { Alert, Badge, Button, Form, Modal, Spinner, Table } from "react-bootstrap";

import ComponentContainerCard from "@/components/ComponentContainerCard";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

export type CrudColumn = {
  key: string;
  label: string;
  render?: (row: Record<string, any>) => string | number | JSX.Element | null | undefined;
};

type CrudOption = {
  label: string;
  value: string;
};

export type CrudField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "time" | "select" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: CrudOption[];
  helpText?: string;
  initialValue?: string | number | boolean;
  fromValue?: (value: unknown, row: Record<string, any> | null) => string | boolean;
  toPayload?: (value: string | boolean, row: Record<string, any> | null) => unknown;
};

type AdminCrudSectionProps = {
  id: string;
  title: string;
  subTitle?: string;
  badgeLabel?: string;
  rows: Record<string, any>[];
  isLoading: boolean;
  error?: string | null;
  columns: CrudColumn[];
  fields: CrudField[];
  emptyText?: string;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onCreate?: (payload: Record<string, unknown>) => Promise<unknown>;
  onUpdate?: (id: string, payload: Record<string, unknown>) => Promise<unknown>;
  onDelete?: (id: string) => Promise<unknown>;
  onRefresh?: () => void;
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

const buildPayload = (
  fields: CrudField[],
  formState: Record<string, string | boolean>,
  row: Record<string, any> | null
) => {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const rawValue = formState[field.key];
    if (rawValue === undefined) continue;

    if (field.toPayload) {
      payload[field.key] = field.toPayload(rawValue, row);
      continue;
    }

    if (field.type === "checkbox") {
      payload[field.key] = Boolean(rawValue);
      continue;
    }

    if (field.type === "number") {
      const value = typeof rawValue === "string" ? rawValue.trim() : String(rawValue);
      payload[field.key] = value.length > 0 ? Number(value) : null;
      continue;
    }

    const value = typeof rawValue === "string" ? rawValue.trim() : String(rawValue);
    payload[field.key] = value.length > 0 ? value : null;
  }
  return payload;
};

const AdminCrudSection = ({
  id,
  title,
  subTitle,
  badgeLabel,
  rows,
  isLoading,
  error,
  columns,
  fields,
  emptyText = "No records found.",
  canCreate = true,
  canUpdate = true,
  canDelete = true,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
}: AdminCrudSectionProps) => {
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeRow, setActiveRow] = useState<Record<string, any> | null>(null);
  const [formState, setFormState] = useState<Record<string, string | boolean>>({});
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const hasActions = useMemo(
    () => (canUpdate && typeof onUpdate === "function") || (canDelete && typeof onDelete === "function"),
    [canDelete, canUpdate, onDelete, onUpdate]
  );

  const openCreateModal = () => {
    const initialState: Record<string, string | boolean> = {};
    for (const field of fields) {
      const initialValue = field.initialValue;
      if (field.type === "checkbox") {
        initialState[field.key] = Boolean(initialValue);
      } else if (typeof initialValue === "number") {
        initialState[field.key] = String(initialValue);
      } else if (typeof initialValue === "string") {
        initialState[field.key] = initialValue;
      } else {
        initialState[field.key] = "";
      }
    }
    setModalMode("create");
    setActiveRow(null);
    setFormState(initialState);
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = (row: Record<string, any>) => {
    const initialState: Record<string, string | boolean> = {};
    for (const field of fields) {
      const value = row[field.key];
      if (field.fromValue) {
        initialState[field.key] = field.fromValue(value, row);
      } else if (field.type === "checkbox") {
        initialState[field.key] = Boolean(value);
      } else if (value === null || value === undefined) {
        initialState[field.key] = "";
      } else {
        initialState[field.key] = String(value);
      }
    }
    setModalMode("edit");
    setActiveRow(row);
    setFormState(initialState);
    setModalError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setShowModal(false);
    setModalError(null);
  };

  const handleChange = (field: CrudField, value: string | boolean) => {
    setFormState((previous) => ({ ...previous, [field.key]: value }));
  };

  const handleSubmit = async () => {
    if (modalMode === "create" && typeof onCreate !== "function") return;
    if (modalMode === "edit" && typeof onUpdate !== "function") return;

    for (const field of fields) {
      if (!field.required) continue;
      const value = formState[field.key];
      if (field.type === "checkbox") {
        if (value !== true) {
          setModalError(`${field.label} is required.`);
          return;
        }
      } else {
        const textValue = typeof value === "string" ? value.trim() : "";
        if (!textValue) {
          setModalError(`${field.label} is required.`);
          return;
        }
      }
    }

    const payload = buildPayload(fields, formState, activeRow);
    setModalError(null);
    setIsSaving(true);
    try {
      if (modalMode === "create") {
        await onCreate?.(payload);
      } else if (activeRow?.id) {
        await onUpdate?.(String(activeRow.id), payload);
      } else {
        throw new Error("Missing record identifier for update.");
      }
      setShowModal(false);
      onRefresh?.();
    } catch (submissionError) {
      setModalError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to save changes."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (row: Record<string, any>) => {
    if (!onDelete || !row?.id) return;
    const confirmed = window.confirm("Delete this record?");
    if (!confirmed) return;
    try {
      await onDelete(String(row.id));
      onRefresh?.();
    } catch (deleteError) {
      setModalError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete record."
      );
      setShowModal(true);
    }
  };

  return (
    <Fragment>
      <ComponentContainerCard id={id} title={title}>
        {subTitle ? <p className="text-muted mb-3">{subTitle}</p> : null}
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
          <div>
            {badgeLabel ? (
              <Badge bg="soft-primary" text="primary">
                {badgeLabel}
              </Badge>
            ) : null}
          </div>
          <div className="d-flex gap-2">
            {onRefresh ? (
              <Button variant="outline-secondary" onClick={onRefresh}>
                <IconifyIcon icon="ri:refresh-line" className="me-1" />
                Refresh
              </Button>
            ) : null}
            {canCreate && onCreate ? (
              <Button onClick={openCreateModal}>
                <IconifyIcon icon="ri:add-line" className="me-1" />
                Add
              </Button>
            ) : null}
          </div>
        </div>

        {error ? <Alert variant="danger">{error}</Alert> : null}
        {modalError && !showModal ? <Alert variant="danger">{modalError}</Alert> : null}

        {isLoading ? (
          <div className="d-flex align-items-center gap-2 text-muted py-4">
            <Spinner animation="border" size="sm" />
            Loading records...
          </div>
        ) : rows.length === 0 ? (
          <Alert variant="light" className="mb-0">
            {emptyText}
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  {hasActions ? <th className="text-end">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={String(row.id || Math.random())}>
                    {columns.map((column) => (
                      <td key={`${String(row.id)}-${column.key}`}>
                        {column.render ? column.render(row) : formatValue(row[column.key])}
                      </td>
                    ))}
                    {hasActions ? (
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          {canUpdate && onUpdate ? (
                            <Button variant="outline-primary" size="sm" onClick={() => openEditModal(row)}>
                              Edit
                            </Button>
                          ) : null}
                          {canDelete && onDelete ? (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(row)}
                            >
                              Delete
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </ComponentContainerCard>

      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton={!isSaving}>
          <Modal.Title>{modalMode === "create" ? `Add ${title}` : `Edit ${title}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError ? <Alert variant="danger">{modalError}</Alert> : null}
          <Form>
            <div className="row g-3">
              {fields.map((field) => (
                <div
                  className={field.type === "textarea" ? "col-12" : "col-md-6"}
                  key={`field-${field.key}`}
                >
                  {field.type === "checkbox" ? (
                    <Form.Check
                      type="switch"
                      id={`${id}-${field.key}`}
                      label={field.label}
                      checked={Boolean(formState[field.key])}
                      onChange={(event) => handleChange(field, event.currentTarget.checked)}
                    />
                  ) : (
                    <Fragment>
                      <Form.Label>{field.label}</Form.Label>
                      {field.type === "textarea" ? (
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={String(formState[field.key] ?? "")}
                          placeholder={field.placeholder}
                          onChange={(event) => handleChange(field, event.currentTarget.value)}
                        />
                      ) : field.type === "select" ? (
                        <Form.Select
                          value={String(formState[field.key] ?? "")}
                          onChange={(event) => handleChange(field, event.currentTarget.value)}
                        >
                          <option value="">Select</option>
                          {(field.options || []).map((option) => (
                            <option key={`${field.key}-${option.value}`} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                      ) : (
                        <Form.Control
                          type={field.type}
                          value={String(formState[field.key] ?? "")}
                          placeholder={field.placeholder}
                          onChange={(event) => handleChange(field, event.currentTarget.value)}
                        />
                      )}
                      {field.helpText ? (
                        <Form.Text className="text-muted">{field.helpText}</Form.Text>
                      ) : null}
                    </Fragment>
                  )}
                </div>
              ))}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeModal} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <Fragment>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </Fragment>
            ) : (
              "Save"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default AdminCrudSection;

