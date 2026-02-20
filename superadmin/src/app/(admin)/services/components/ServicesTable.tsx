"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Database } from "@/lib/database.types";
import { Button } from "react-bootstrap";
import Link from "next/link";
import { useDeleteService } from "@/hooks/useServices";
import { toast } from "react-hot-toast";
import { useState } from "react";

type Service = Database["public"]["Tables"]["services"]["Row"] & {
  communities?: Database["public"]["Tables"]["communities"]["Row"];
};

interface ServicesTableProps {
  services: Service[];
}

const ServicesTable = ({ services }: ServicesTableProps) => {
  const deleteServiceMutation = useDeleteService();
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    if (window.confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) {
      try {
        setDeletingServiceId(serviceId);
        await deleteServiceMutation.mutateAsync(serviceId);
        toast.success('Service deleted successfully!');
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service. Please try again.');
      } finally {
        setDeletingServiceId(null);
      }
    }
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-5">
        <IconifyIcon icon="solar:settings-broken" className="fs-1 text-muted mb-3" />
        <h5 className="text-muted">No services available</h5>
        <p className="text-muted mb-0">Start by adding your first service offering.</p>
      </div>
    );
  }

  const getCategoryBadgeColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'cleaning': 'primary',
      'maintenance': 'warning', 
      'delivery': 'info',
      'personal_care': 'success',
      'home_services': 'secondary',
      'default': 'light'
    };
    return categoryColors[category] || categoryColors.default;
  };

  return (
    <div className="table-responsive">
      <table className="table align-middle text-nowrap table-hover table-centered mb-0">
        <thead className="bg-light-subtle">
          <tr>
            <th style={{ width: 20 }}>
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="customCheck1" />
                <label className="form-check-label" htmlFor="customCheck1" />
              </div>
            </th>
            <th>Service Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Community</th>
            <th>Status</th>
            <th>Created Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id={`check-${service.id}`} />
                  <label className="form-check-label" htmlFor={`check-${service.id}`}>
                    &nbsp;
                  </label>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar-sm bg-light rounded d-flex align-items-center justify-content-center">
                    <IconifyIcon 
                      icon="solar:settings-minimalistic-broken" 
                      className="fs-18 text-primary"
                    />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-medium">{service.name}</h6>
                    <p className="mb-0 text-muted fs-12">
                      {service.description ? service.description.slice(0, 50) + '...' : 'No description'}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <span className={`badge bg-${getCategoryBadgeColor(service.category || '')} text-white fs-11`}>
                  {service.category?.replace('_', ' ') || 'General'} 
                </span>
              </td>
              <td>
                <span className="fw-semibold">
                  {service.base_price ? `$${service.base_price}` : 'Free'}
                </span>
              </td>
              <td>
                <span className="text-muted fs-13">
                  {service.communities?.name || 'All Communities'}
                </span>
              </td>
              <td>
                <span className={`badge bg-${service.is_active ? 'success' : 'danger'} text-white fs-11`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <span className="text-muted fs-13">
                  {service.created_at 
                    ? new Date(service.created_at).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'Unknown'
                  }
                </span>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Link href={`/services/details?id=${service.id}`}>
                    <Button variant="light" size="sm" title="View Details">
                      <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                    </Button>
                  </Link>
                  <Button 
                    variant="soft-primary" 
                    size="sm" 
                    title="Edit Service"
                    onClick={() => toast('Edit functionality coming soon!', { icon: 'ℹ️' })}
                  >
                    <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                  </Button>
                  <Button 
                    variant="soft-danger" 
                    size="sm" 
                    title="Delete Service"
                    onClick={() => handleDeleteService(String(service.id), service.name)}
                    disabled={deletingServiceId === String(service.id)}
                  >
                    {deletingServiceId === String(service.id) ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Deleting...</span>
                      </div>
                    ) : (
                      <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesTable;
