'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Nav, Tab, Button, Table, Badge, Form, Modal, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiDownload, FiUpload, FiFile, FiFileText, FiFolder, FiEye, FiShare2, FiLock, FiUnlock, FiCalendar, FiUser, FiArchive, FiClock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { useListAgencyDocuments, useCreateAgencyDocument, useUpdateAgencyDocument, useDeleteAgencyDocument, UIDocument } from '@/hooks/useAgencyDocuments';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Validation schema for document form
const documentSchema = yup.object().shape({
  name: yup.string().required('Document name is required'),
  category: yup.string().required('Category is required'),
  type: yup.string().required('Document type is required'),
  description: yup.string().required('Description is required'),
  access: yup.string().required('Access level is required'),
  retention: yup.string().required('Retention period is required'),
  status: yup.string().required('Status is required'),
  tags: yup.array().of(yup.string().required()).default([]),
  reminderDays: yup.number().min(0, 'Reminder days cannot be negative').default(0),
  isConfidential: yup.boolean().default(false),
  requiresApproval: yup.boolean().default(false),
  autoArchive: yup.boolean().default(false)
});

type DocumentFormData = yup.InferType<typeof documentSchema>;

const categoryOptions = [
  'Legal Documents', 'Templates', 'Policies', 'Compliance', 
  'Procedures', 'Financial Records', 'Contracts', 'Reports'
];

const typeOptions = [
  'Certificate', 'Agreement', 'Policy Document', 'Compliance Report', 
  'SOP', 'Audit Report', 'Contract', 'Form', 'Manual'
];

const accessOptions = ['Public', 'Internal', 'Restricted', 'Confidential'];
const retentionOptions = ['1 Year', '3 Years', '5 Years', '7 Years', '10 Years', 'Permanent'];
const statusOptions = ['Active', 'Under Review', 'Expired', 'Archived', 'Draft'];

const AgencyDocumentsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<UIDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAccess, setFilterAccess] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Use Supabase hooks
  const { data: documentsList = [], isLoading, error } = useListAgencyDocuments();
  const createDocumentMutation = useCreateAgencyDocument();
  const updateDocumentMutation = useUpdateAgencyDocument();
  const deleteDocumentMutation = useDeleteAgencyDocument();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<DocumentFormData>({
    resolver: yupResolver(documentSchema),
    defaultValues: {
      tags: [],
      reminderDays: 0,
      isConfidential: false,
      requiresApproval: false,
      autoArchive: false
    }
  });

  // Real-time subscription for live updates
  useEffect(() => {
    const channel = supabase
      .channel('public:agency_documents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agency_documents' }, () => {
        queryClient.invalidateQueries({ queryKey: ['agency_documents'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleAddDocument = () => {
    setEditingDocument(null);
    reset();
    setShowModal(true);
  };

  const handleEditDocument = (document: UIDocument) => {
    setEditingDocument(document);
    setValue('name', document.name);
    setValue('category', document.category);
    setValue('type', document.type);
    setValue('description', document.description);
    setValue('access', document.access);
    setValue('retention', document.retention);
    setValue('status', document.status);
    setValue('tags', document.tags);
    setValue('reminderDays', document.reminderDays);
    setValue('isConfidential', document.isConfidential);
    setValue('requiresApproval', document.requiresApproval);
    setValue('autoArchive', document.autoArchive);
    setShowModal(true);
  };

  const handleDeleteDocument = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(documentId, {
        onSuccess: () => {
          toast.success('Document deleted successfully');
        },
        onError: (error) => {
          toast.error(`Failed to delete document: ${error.message}`);
        }
      });
    }
  };

  const onSubmit = (data: DocumentFormData) => {
    if (editingDocument) {
      updateDocumentMutation.mutate({ id: editingDocument.id, data }, {
        onSuccess: () => {
          toast.success('Document updated successfully');
          setShowModal(false);
          reset();
        },
        onError: (error) => {
          toast.error(`Failed to update document: ${error.message}`);
        }
      });
    } else {
      createDocumentMutation.mutate(data, {
        onSuccess: () => {
          toast.success('Document created successfully');
          setShowModal(false);
          reset();
        },
        onError: (error) => {
          toast.error(`Failed to create document: ${error.message}`);
        }
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Active': 'success',
      'Under Review': 'warning',
      'Expired': 'danger',
      'Archived': 'secondary',
      'Draft': 'info'
    };
    return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>;
  };

  const getAccessBadge = (access: string) => {
    const accessColors: { [key: string]: string } = {
      'Public': 'success',
      'Internal': 'primary',
      'Restricted': 'warning',
      'Confidential': 'danger'
    };
    return <Badge bg={accessColors[access] || 'secondary'}>{access}</Badge>;
  };

  const getFileIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      'Certificate': FiFile,
      'Agreement': FiFileText,
      'Policy Document': FiFolder,
      'Compliance Report': FiFileText,
      'SOP': FiFile,
      'Audit Report': FiFileText,
      'Contract': FiFileText,
      'Form': FiFile,
      'Manual': FiFolder
    };
    const IconComponent = iconMap[type] || FiFile;
    return <IconComponent className="me-2" />;
  };

  // Filter documents based on search and filters
  const filteredDocuments = documentsList.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || doc.category === filterCategory;
    const matchesStatus = !filterStatus || doc.status === filterStatus;
    const matchesAccess = !filterAccess || doc.access === filterAccess;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesAccess;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, filterAccess]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Calculate statistics
  const totalDocuments = documentsList.length;
  const activeDocuments = documentsList.filter(d => d.status === 'Active').length;
  const expiringDocuments = documentsList.filter(d => {
    if (!d.expiryDate) return false;
    const expiryDate = new Date(d.expiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  }).length;

  const totalFileSize = documentsList.reduce((sum, doc) => {
    const sizeValue = parseFloat(doc.fileSize);
    const unit = doc.fileSize.split(' ')[1];
    return sum + (unit === 'MB' ? sizeValue : sizeValue / 1024);
  }, 0);

  if (error) {
    return (
      <div className="container-fluid">
        <Alert variant="danger">
          <h5>Error Loading Documents</h5>
          <p>{error.message}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Row className="mb-4">
        <Col>
          <h1 className="h3 mb-0 text-gray-800">Agency Documents & Records</h1>
          <p className="text-muted">Manage documents, templates, and record retention</p>
        </Col>
      </Row>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')}>
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link eventKey="overview" className="text-decoration-none">
                      <FiFolder className="me-2" />
                      Overview
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="documents" className="text-decoration-none">
                      <FiFile className="me-2" />
                      Document Library
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="compliance" className="text-decoration-none">
                      <FiCheckCircle className="me-2" />
                      Compliance Tracking
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="retention" className="text-decoration-none">
                      <FiArchive className="me-2" />
                      Retention Management
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body>
                <Tab.Content>
                  {/* Overview Tab */}
                  <Tab.Pane eventKey="overview">
                    <Row className="mb-4">
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-primary text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white-50 mb-1">Total Documents</h6>
                                <h3 className="mb-0">{totalDocuments}</h3>
                              </div>
                              <FiFile size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-success text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white-50 mb-1">Active Documents</h6>
                                <h3 className="mb-0">{activeDocuments}</h3>
                              </div>
                              <FiCheckCircle size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-warning text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white-50 mb-1">Expiring Soon</h6>
                                <h3 className="mb-0">{expiringDocuments}</h3>
                              </div>
                              <FiAlertTriangle size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-info text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white-50 mb-1">Storage Used</h6>
                                <h3 className="mb-0">{totalFileSize.toFixed(1)} MB</h3>
                              </div>
                              <FiArchive size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={8} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Document Categories</h6>
                          </Card.Header>
                          <Card.Body>
                            {categoryOptions.map(category => {
                              const categoryDocs = documentsList.filter(d => d.category === category);
                              const percentage = totalDocuments > 0 ? (categoryDocs.length / totalDocuments) * 100 : 0;
                              const categorySize = categoryDocs.reduce((sum, doc) => {
                                const sizeValue = parseFloat(doc.fileSize);
                                const unit = doc.fileSize.split(' ')[1];
                                return sum + (unit === 'MB' ? sizeValue : sizeValue / 1024);
                              }, 0);

                              return (
                                <div key={category} className="mb-3">
                                  <div className="d-flex justify-content-between mb-1">
                                    <span className="font-weight-bold">{category}</span>
                                    <span>{categoryDocs.length} docs • {categorySize.toFixed(1)} MB</span>
                                  </div>
                                  <div className="progress" style={{ height: '8px' }}>
                                    <div 
                                      className="progress-bar bg-primary" 
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Recent Activity</h6>
                          </Card.Header>
                          <Card.Body>
                            {documentsList
                              .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
                              .slice(0, 5)
                              .map(doc => (
                                <div key={doc.id} className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <div className="font-weight-bold">{doc.name}</div>
                                    <small className="text-muted">Modified: {doc.lastModified}</small>
                                  </div>
                                  <div className="text-end">
                                    {getStatusBadge(doc.status)}
                                  </div>
                                </div>
                              ))}
                          </Card.Body>
                        </Card>

                        <Card className="shadow-sm mt-3">
                          <Card.Header>
                            <h6 className="mb-0">Quick Actions</h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="d-grid gap-2">
                              <Button variant="outline-primary" onClick={handleAddDocument}>
                                <FiPlus className="me-2" />
                                Upload Document
                              </Button>
                              <Button variant="outline-success">
                                <FiDownload className="me-2" />
                                Export Document List
                              </Button>
                              <Button variant="outline-info">
                                <FiCalendar className="me-2" />
                                Review Expiring Docs
                              </Button>
                              <Button variant="outline-warning">
                                <FiArchive className="me-2" />
                                Archive Management
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  {/* Document Library Tab */}
                  <Tab.Pane eventKey="documents">
                    <Row className="mb-3">
                      <Col md={8}>
                        <div className="d-flex gap-2">
                          <div className="position-relative flex-grow-1">
                            <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                            <Form.Control
                              type="text"
                              placeholder="Search documents..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="ps-5"
                            />
                          </div>
                          <Form.Select 
                            value={filterCategory} 
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{ width: 'auto' }}
                          >
                            <option value="">All Categories</option>
                            {categoryOptions.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </Form.Select>
                          <Form.Select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ width: 'auto' }}
                          >
                            <option value="">All Status</option>
                            {statusOptions.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </Form.Select>
                          <Form.Select 
                            value={filterAccess} 
                            onChange={(e) => setFilterAccess(e.target.value)}
                            style={{ width: 'auto' }}
                          >
                            <option value="">All Access</option>
                            {accessOptions.map(access => (
                              <option key={access} value={access}>{access}</option>
                            ))}
                          </Form.Select>
                        </div>
                      </Col>
                      <Col md={4} className="text-end">
                        <Button variant="primary" onClick={handleAddDocument}>
                          <FiUpload className="me-2" />
                          Upload Document
                        </Button>
                      </Col>
                    </Row>

                    <Card className="shadow-sm">
                      <div className="table-responsive">
                        <Table hover className="mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th>Document</th>
                              <th>Category & Type</th>
                              <th>Access & Status</th>
                              <th>File Info</th>
                              <th>Expiry</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {isLoading ? (
                              <tr>
                                <td colSpan={6} className="text-center py-4">
                                  <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                  <div className="mt-2">Loading documents...</div>
                                </td>
                              </tr>
                            ) : filteredDocuments.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center py-4">
                                  <div className="text-muted">
                                    <FiFile size={48} className="mb-3" />
                                    <div>No documents found</div>
                                    <small>Try adjusting your search or filters</small>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              currentDocuments.map(doc => (
                                <tr key={doc.id}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      {getFileIcon(doc.type)}
                                      <div>
                                        <div className="font-weight-bold">{doc.name}</div>
                                        <small className="text-muted">{doc.description.substring(0, 50)}...</small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div>
                                      <Badge bg="info" className="me-2">{doc.category}</Badge>
                                      <div className="mt-1">
                                        <small className="text-muted">{doc.type}</small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div>
                                      {getAccessBadge(doc.access)}
                                      <div className="mt-1">
                                        {getStatusBadge(doc.status)}
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div>
                                      <div className="font-weight-bold">{doc.fileSize}</div>
                                      <small className="text-muted">v{doc.version}</small>
                                      <div className="mt-1">
                                        <small className="text-success">{doc.downloads} downloads</small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    {doc.expiryDate ? (
                                      <div>
                                        <div className="font-weight-bold">{doc.expiryDate}</div>
                                        {new Date(doc.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                                          <Badge bg="warning">Expiring Soon</Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <Badge bg="secondary">No Expiry</Badge>
                                    )}
                                  </td>
                                  <td>
                                    <div className="d-flex gap-1">
                                      <Button variant="outline-primary" size="sm">
                                        <FiEye />
                                      </Button>
                                      <Button variant="outline-success" size="sm">
                                        <FiDownload />
                                      </Button>
                                      <Button 
                                        variant="outline-secondary" 
                                        size="sm"
                                        onClick={() => handleEditDocument(doc)}
                                      >
                                        <FiEdit2 />
                                      </Button>
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        disabled={deleteDocumentMutation.isPending}
                                      >
                                        <FiTrash2 />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </Card>

                    {/* Pagination Controls */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted">Show</span>
                        <Form.Select 
                          value={itemsPerPage} 
                          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                          style={{ width: 'auto' }}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </Form.Select>
                        <span className="text-muted">entries</span>
                      </div>
                      
                      <div className="text-muted">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredDocuments.length)} of {filteredDocuments.length} entries
                      </div>
                      
                      <div className="d-flex align-items-center gap-1">
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "primary" : "outline-secondary"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </Tab.Pane>

                  {/* Compliance Tracking Tab */}
                  <Tab.Pane eventKey="compliance">
                    <Row>
                      <Col md={6} className="mb-4">
                        <Card className="shadow-sm" style={{ height: '480px' }}>
                          <Card.Header>
                            <h6 className="mb-0">Compliance Status Overview</h6>
                          </Card.Header>
                          <Card.Body style={{ overflowY: 'auto' }}>
                            {categoryOptions.map(category => {
                              const categoryDocs = documentsList.filter(d => d.category === category);
                              const activeDocs = categoryDocs.filter(d => d.status === 'Active').length;
                              const compliance = categoryDocs.length > 0 ? (activeDocs / categoryDocs.length) * 100 : 0;
                              
                              return (
                                <div key={category} className="mb-4">
                                  <div className="d-flex justify-content-between mb-2">
                                    <span className="font-weight-bold">{category}</span>
                                    <span className="text-muted">{activeDocs}/{categoryDocs.length} active</span>
                                  </div>
                                  <div className="progress" style={{ height: '10px' }}>
                                    <div 
                                      className={`progress-bar ${compliance >= 80 ? 'bg-success' : compliance >= 60 ? 'bg-warning' : 'bg-danger'}`}
                                      style={{ width: `${compliance}%` }}
                                    ></div>
                                  </div>
                                  <small className="text-muted">{compliance.toFixed(0)}% compliance</small>
                                </div>
                              );
                            })}
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6} className="mb-4">
                        <Card className="shadow-sm" style={{ height: '480px' }}>
                          <Card.Header>
                            <h6 className="mb-0">Documents Requiring Attention</h6>
                          </Card.Header>
                          <Card.Body style={{ overflowY: 'auto' }}>
                            {documentsList
                              .filter(doc => 
                                doc.status === 'Under Review' || 
                                doc.status === 'Expired' ||
                                (doc.expiryDate && new Date(doc.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                              )
                              .map(doc => (
                                <div key={doc.id} className="mb-3 p-3 border rounded">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="font-weight-bold">{doc.name}</span>
                                    {getStatusBadge(doc.status)}
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <small className="text-muted">{doc.category}</small>
                                    {doc.expiryDate && (
                                      <small className="text-danger">Expires: {doc.expiryDate}</small>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  {/* Retention Management Tab */}
                  <Tab.Pane eventKey="retention">
                    <Row>
                      <Col md={8} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Retention Policy Overview</h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="table-responsive">
                              <Table>
                                <thead>
                                  <tr>
                                    <th>Retention Period</th>
                                    <th>Document Count</th>
                                    <th>Storage Used</th>
                                    <th>Auto Archive</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {retentionOptions.map(period => {
                                    const periodDocs = documentsList.filter(d => d.retention === period);
                                    const autoArchiveDocs = periodDocs.filter(d => d.autoArchive).length;
                                    const periodSize = periodDocs.reduce((sum, doc) => {
                                      const sizeValue = parseFloat(doc.fileSize);
                                      const unit = doc.fileSize.split(' ')[1];
                                      return sum + (unit === 'MB' ? sizeValue : sizeValue / 1024);
                                    }, 0);

                                    return (
                                      <tr key={period}>
                                        <td className="font-weight-bold">{period}</td>
                                        <td>{periodDocs.length}</td>
                                        <td>{periodSize.toFixed(1)} MB</td>
                                        <td>
                                          <Badge bg={autoArchiveDocs > 0 ? 'success' : 'secondary'}>
                                            {autoArchiveDocs}/{periodDocs.length}
                                          </Badge>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </Table>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Retention Statistics</h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="mb-4">
                              <h6 className="text-muted">Total Retention Cost</h6>
                              <h3 className="text-primary">${(totalFileSize * 0.10).toFixed(2)}/month</h3>
                              <small className="text-muted">Based on storage usage</small>
                            </div>
                            <div className="mb-4">
                              <h6 className="text-muted">Auto-Archive Enabled</h6>
                              <h3 className="text-success">
                                {documentsList.filter(d => d.autoArchive).length}/{documentsList.length}
                              </h3>
                              <small className="text-muted">Documents with auto-archive</small>
                            </div>
                            <div className="mb-4">
                              <h6 className="text-muted">Average Retention</h6>
                              <h3 className="text-info">4.2 Years</h3>
                              <small className="text-muted">Across all documents</small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Tab.Container>

      {/* Add/Edit Document Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingDocument ? 'Edit Document' : 'Upload New Document'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Document Name *</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('name')}
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select {...register('category')} isInvalid={!!errors.category}>
                    <option value="">Select Category</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.category?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Document Type *</Form.Label>
                  <Form.Select {...register('type')} isInvalid={!!errors.type}>
                    <option value="">Select Type</option>
                    {typeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.type?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Access Level *</Form.Label>
                  <Form.Select {...register('access')} isInvalid={!!errors.access}>
                    <option value="">Select Access Level</option>
                    {accessOptions.map(access => (
                      <option key={access} value={access}>{access}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.access?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register('description')}
                isInvalid={!!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Retention Period *</Form.Label>
                  <Form.Select {...register('retention')} isInvalid={!!errors.retention}>
                    <option value="">Select Retention Period</option>
                    {retentionOptions.map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.retention?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select {...register('status')} isInvalid={!!errors.status}>
                    <option value="">Select Status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.status?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Check
                  type="checkbox"
                  label="Confidential"
                  {...register('isConfidential')}
                  className="mb-3"
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  type="checkbox"
                  label="Requires Approval"
                  {...register('requiresApproval')}
                  className="mb-3"
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  type="checkbox"
                  label="Auto Archive"
                  {...register('autoArchive')}
                  className="mb-3"
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Reminder Days Before Expiry</Form.Label>
              <Form.Control
                type="number"
                {...register('reminderDays')}
                isInvalid={!!errors.reminderDays}
              />
              <Form.Control.Feedback type="invalid">
                {errors.reminderDays?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingDocument ? 'Update Document' : 'Upload Document'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AgencyDocumentsPage;
