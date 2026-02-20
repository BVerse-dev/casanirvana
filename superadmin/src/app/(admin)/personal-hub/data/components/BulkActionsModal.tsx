"use client";

import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Table, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface DataPackage {
  id: string;
  name: string;
  provider: {
    name: string;
    logo: string;
  };
  dataAmount: string;
  validityDays: number;
  price: string;
  description?: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  salesCount: number;
}

interface BulkActionsModalProps {
  show: boolean;
  onHide: () => void;
  selectedPackages: DataPackage[];
  onBulkAction?: (action: string, packages: DataPackage[], options: any) => void;
}

const BulkActionsModal: React.FC<BulkActionsModalProps> = ({ 
  show, 
  onHide, 
  selectedPackages,
  onBulkAction
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionOptions, setActionOptions] = useState<any>({});
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedPackages || selectedPackages.length === 0) return null;

  // Available bulk actions
  const bulkActions = [
    {
      value: 'activate',
      label: 'Activate Packages',
      description: 'Make selected packages available for purchase',
      icon: 'ri:play-line',
      variant: 'success'
    },
    {
      value: 'deactivate',
      label: 'Deactivate Packages',
      description: 'Remove selected packages from sale',
      icon: 'ri:pause-line',
      variant: 'warning'
    },
    {
      value: 'feature',
      label: 'Mark as Featured',
      description: 'Promote selected packages as featured',
      icon: 'ri:star-line',
      variant: 'info'
    },
    {
      value: 'unfeature',
      label: 'Remove Featured Status',
      description: 'Remove featured status from selected packages',
      icon: 'ri:star-off-line',
      variant: 'secondary'
    },
    {
      value: 'price_update',
      label: 'Update Prices',
      description: 'Apply price changes to selected packages',
      icon: 'ri:money-dollar-circle-line',
      variant: 'primary'
    },
    {
      value: 'duplicate',
      label: 'Duplicate Packages',
      description: 'Create copies of selected packages',
      icon: 'ri:file-copy-line',
      variant: 'info'
    },
    {
      value: 'delete',
      label: 'Delete Packages',
      description: 'Permanently remove selected packages',
      icon: 'ri:delete-bin-line',
      variant: 'danger'
    }
  ];

  // Get action details
  const getActionDetails = (actionValue: string) => {
    return bulkActions.find(action => action.value === actionValue);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAction || !confirmed) return;

    setIsSubmitting(true);
    
    try {
      if (onBulkAction) {
        await onBulkAction(selectedAction, selectedPackages, actionOptions);
      }
      
      // Reset form
      setSelectedAction('');
      setActionOptions({});
      setConfirmed(false);
      onHide();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedAction('');
    setActionOptions({});
    setConfirmed(false);
    onHide();
  };

  // Render action-specific options
  const renderActionOptions = () => {
    switch (selectedAction) {
      case 'price_update':
        return (
          <div className="mb-3">
            <Form.Group className="mb-3">
              <Form.Label>Price Update Method</Form.Label>
              <Form.Select
                value={actionOptions.method || 'percentage'}
                onChange={(e) => setActionOptions({...actionOptions, method: e.target.value})}
              >
                <option value="percentage">Percentage Change</option>
                <option value="fixed_amount">Fixed Amount Change</option>
                <option value="set_price">Set New Price</option>
              </Form.Select>
            </Form.Group>
            
            {actionOptions.method === 'percentage' && (
              <Form.Group className="mb-3">
                <Form.Label>Percentage Change (%)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  value={actionOptions.percentage || ''}
                  onChange={(e) => setActionOptions({...actionOptions, percentage: e.target.value})}
                  placeholder="e.g., 10 for 10% increase, -5 for 5% decrease"
                />
              </Form.Group>
            )}
            
            {actionOptions.method === 'fixed_amount' && (
              <Form.Group className="mb-3">
                <Form.Label>Amount Change ($)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={actionOptions.amount || ''}
                  onChange={(e) => setActionOptions({...actionOptions, amount: e.target.value})}
                  placeholder="e.g., 1.00 for $1 increase, -0.50 for $0.50 decrease"
                />
              </Form.Group>
            )}
            
            {actionOptions.method === 'set_price' && (
              <Form.Group className="mb-3">
                <Form.Label>New Price ($)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={actionOptions.newPrice || ''}
                  onChange={(e) => setActionOptions({...actionOptions, newPrice: e.target.value})}
                  placeholder="e.g., 5.99"
                />
              </Form.Group>
            )}
          </div>
        );
        
      case 'duplicate':
        return (
          <div className="mb-3">
            <Form.Group className="mb-3">
              <Form.Label>Name Suffix</Form.Label>
              <Form.Control
                type="text"
                value={actionOptions.suffix || ' (Copy)'}
                onChange={(e) => setActionOptions({...actionOptions, suffix: e.target.value})}
                placeholder="e.g., ' (Copy)', ' - New', ' v2'"
              />
              <Form.Text className="text-muted">
                This will be added to the end of each package name
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="duplicate-inactive"
                label="Create duplicates as inactive"
                checked={actionOptions.createInactive || false}
                onChange={(e) => setActionOptions({...actionOptions, createInactive: e.target.checked})}
              />
            </Form.Group>
          </div>
        );
        
      case 'delete':
        return (
          <Alert variant="danger" className="mb-3">
            <div className="d-flex">
              <IconifyIcon icon="ri:alert-line" className="me-2 mt-1" />
              <div>
                <strong>Warning:</strong> This action cannot be undone. All selected packages and their associated data will be permanently deleted.
                <br /><br />
                <Form.Check
                  type="checkbox"
                  id="delete-confirmation"
                  label="I understand that this action is permanent"
                  checked={actionOptions.deleteConfirmed || false}
                  onChange={(e) => setActionOptions({...actionOptions, deleteConfirmed: e.target.checked})}
                />
              </div>
            </div>
          </Alert>
        );
        
      default:
        return null;
    }
  };

  // Get impact summary
  const getImpactSummary = () => {
    const actionDetails = getActionDetails(selectedAction);
    if (!actionDetails) return null;

    const activePackages = selectedPackages.filter(pkg => pkg.status === 'active').length;
    const inactivePackages = selectedPackages.filter(pkg => pkg.status === 'inactive').length;
    const featuredPackages = selectedPackages.filter(pkg => pkg.isFeatured).length;

    switch (selectedAction) {
      case 'activate':
        return `${inactivePackages} packages will be activated and made available for purchase.`;
      case 'deactivate':
        return `${activePackages} packages will be deactivated and removed from sale.`;
      case 'feature':
        return `${selectedPackages.length - featuredPackages} packages will be marked as featured.`;
      case 'unfeature':
        return `${featuredPackages} packages will have their featured status removed.`;
      case 'price_update':
        return `Prices for ${selectedPackages.length} packages will be updated according to the specified method.`;
      case 'duplicate':
        return `${selectedPackages.length} new packages will be created as copies of the selected packages.`;
      case 'delete':
        return `${selectedPackages.length} packages will be permanently deleted from the system.`;
      default:
        return actionDetails.description;
    }
  };

  const actionDetails = getActionDetails(selectedAction);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <div className="avatar-sm rounded-circle bg-primary bg-opacity-10 me-2">
            <IconifyIcon icon="ri:settings-3-line" className="text-primary" />
          </div>
          Bulk Actions - {selectedPackages.length} Packages
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Selected Packages Summary */}
        <div className="mb-4 p-3 bg-light rounded">
          <h6 className="mb-2">Selected Packages ({selectedPackages.length})</h6>
          <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <Table className="table-sm mb-0">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Featured</th>
                </tr>
              </thead>
              <tbody>
                {selectedPackages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td>
                      <div>
                        <small className="fw-semibold">{pkg.name}</small>
                        <br />
                        <small className="text-muted">{pkg.id}</small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={pkg.provider.logo} 
                          alt={pkg.provider.name} 
                          height="16" 
                          className="me-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                          }}
                        />
                        <small>{pkg.provider.name}</small>
                      </div>
                    </td>
                    <td>
                      <Badge bg={pkg.status === 'active' ? 'success' : 'secondary'} className="badge-soft">
                        {pkg.status}
                      </Badge>
                    </td>
                    <td>
                      {pkg.isFeatured ? (
                        <IconifyIcon icon="ri:star-fill" className="text-warning" />
                      ) : (
                        <IconifyIcon icon="ri:star-line" className="text-muted" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Action Selection */}
          <Form.Group className="mb-3">
            <Form.Label>Select Action <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setActionOptions({});
                setConfirmed(false);
              }}
              required
            >
              <option value="">Choose an action...</option>
              {bulkActions.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Action Description */}
          {actionDetails && (
            <Alert variant={actionDetails.variant} className="mb-3">
              <div className="d-flex">
                <IconifyIcon icon={actionDetails.icon} className="me-2 mt-1" />
                <div>
                  <strong>{actionDetails.label}</strong>
                  <br />
                  {actionDetails.description}
                </div>
              </div>
            </Alert>
          )}

          {/* Action-specific Options */}
          {selectedAction && renderActionOptions()}

          {/* Impact Summary */}
          {selectedAction && (
            <div className="mb-3 p-3 border rounded">
              <h6 className="mb-2">Impact Summary</h6>
              <p className="text-muted mb-0">{getImpactSummary()}</p>
            </div>
          )}

          {/* Confirmation */}
          {selectedAction && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="action-confirmation"
                label={`I confirm that I want to ${actionDetails?.label.toLowerCase()} for ${selectedPackages.length} packages`}
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                required
              />
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          variant={actionDetails?.variant || 'primary'}
          onClick={handleSubmit}
          disabled={!selectedAction || !confirmed || isSubmitting || (selectedAction === 'delete' && !actionOptions.deleteConfirmed)}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Processing...
            </>
          ) : (
            <>
              <IconifyIcon icon={actionDetails?.icon || 'ri:check-line'} className="me-1" />
              {actionDetails?.label || 'Execute Action'}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkActionsModal;
