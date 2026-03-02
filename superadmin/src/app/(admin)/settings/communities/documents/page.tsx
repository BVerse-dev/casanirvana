'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Badge, Dropdown, Tab, Tabs, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import { useCommunityDocuments, useDocumentCategories, type CommunityDocument, type DocumentCategory } from '@/hooks/useCommunityDocuments';
import { useCreateCommunityDocument } from '@/hooks/useCreateCommunityDocument';
import { useUpdateCommunityDocument } from '@/hooks/useUpdateCommunityDocument';
import { useDeleteCommunityDocument } from '@/hooks/useDeleteCommunityDocument';
import { useCommunityProfiles } from '@/hooks/useCommunityProfiles';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

// Types are imported from hooks

// Mock data removed - using real Supabase data

// Form validation schema
const documentSchema = yup.object().shape({
  community_id: yup.string().required('Community is required'),
  document_type: yup.string().required('Document type is required'),
  category: yup.string().required('Category is required'),
  title: yup.string().required('Title is required'),
  access_level: yup.string().required('Access level is required'),
  status: yup.string().required('Status is required'),
});

const DocumentsRecords = () => {
  // Hooks for data fetching
  const { data: documents = [], isLoading: documentsLoading, error: documentsError } = useCommunityDocuments();
  const { data: communities = [] } = useCommunityProfiles();
  const { data: documentCategories = [], isLoading: categoriesLoading } = useDocumentCategories();
  const createDocument = useCreateCommunityDocument();
  const updateDocument = useUpdateCommunityDocument();
  const deleteDocument = useDeleteCommunityDocument();
  const queryClient = useQueryClient();

  // State
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<CommunityDocument | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:community_documents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_documents' }, () => {
        queryClient.invalidateQueries({ queryKey: ['community_documents'] });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [queryClient]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCommunity, selectedType, selectedStatus]);

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<Partial<CommunityDocument>>({
    resolver: yupResolver(documentSchema),
  });

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const searchableTitle = (doc.title || doc.name || '').toLowerCase();
      const searchableCategory = (doc.category || '').toLowerCase();
      const searchableTags = doc.tags || [];
      const matchesSearch = searchTerm === '' || 
        searchableTitle.includes(searchTerm.toLowerCase()) ||
        searchableCategory.includes(searchTerm.toLowerCase()) ||
        searchableTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCommunity = selectedCommunity === 'all' || doc.community_id === selectedCommunity;
      const matchesType = selectedType === 'all' || doc.document_type === selectedType;
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      
      return matchesSearch && matchesCommunity && matchesType && matchesStatus;
    });
  }, [documents, searchTerm, selectedCommunity, selectedType, selectedStatus]);

  // Pagination logic
  const totalItems = filteredDocuments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);
  const showingFrom = totalItems > 0 ? startIndex + 1 : 0;
  const showingTo = Math.min(endIndex, totalItems);

  const communityOptions = useMemo(() => communities.map((community) => ({
    value: community.id,
    label: community.name,
  })), [communities]);

  const communityNameById = useMemo(() => Object.fromEntries(communities.map((community) => [community.id, community.name])), [communities]);

  const resolveCommunityName = (document: CommunityDocument) =>
    document.community_name || (document.community_id ? communityNameById[document.community_id] : undefined) || 'Unknown Community';

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalDocs = documents?.length || 0;
    const activeDocs = documents?.filter(d => d.status === 'active').length || 0;
    const expiringDocs = documents?.filter(d => d.expiry_date && new Date(d.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length || 0;
    const confidentialDocs = documents?.filter(d => d.is_confidential).length || 0;
    const pendingApproval = documents?.filter(d => d.approval_required && !d.approved_by).length || 0;
    
    const typeCounts = documents?.reduce((acc, doc) => {
      const docType = doc.document_type || 'other';
      acc[docType] = (acc[docType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    return {
      totalDocs,
      activeDocs,
      expiringDocs,
      confidentialDocs,
      pendingApproval,
      typeCounts,
    };
  }, [documents]);

  const handleCreateOrUpdate = async (data: Partial<CommunityDocument>) => {
    try {
      if (editingDocument) {
        // Update existing document
        await updateDocument.mutateAsync({
          id: editingDocument.id,
          ...data,
        });
      } else {
        // Create new document
        const newDocumentData = {
          ...data,
          file_name: selectedFiles?.[0]?.name || 'unknown.pdf',
          file_size: selectedFiles?.[0]?.size || 0,
          file_type: selectedFiles?.[0]?.type || 'application/pdf',
          file_url: `/documents/${selectedFiles?.[0]?.name || 'unknown.pdf'}`,
          version: data.version || '1.0',
          upload_date: new Date().toISOString().split('T')[0],
          uploaded_by: 'admin',
          tags: data.tags || [],
          status: data.status || 'active',
        };
        
        await createDocument.mutateAsync(newDocumentData as any);
      }
      
      setShowModal(false);
      setEditingDocument(null);
      setSelectedFiles(null);
      reset();
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleEdit = (document: CommunityDocument) => {
    setEditingDocument(document);
    reset(document);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (documentToDelete) {
      try {
        await deleteDocument.mutateAsync(documentToDelete);
        setDocumentToDelete(null);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const getTypeBadge = (type: string) => {
    const category = documentCategories.find(c => c.type === type);
    return category?.color || 'secondary';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'success',
      archived: 'secondary',
      expired: 'danger',
      draft: 'warning',
    };
    return colors[status] || 'secondary';
  };

  const getAccessBadge = (access: string) => {
    const colors: Record<string, string> = {
      public: 'success',
      residents: 'info',
      committee: 'warning',
      admin_only: 'danger',
    };
    return colors[access] || 'secondary';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'ri:file-pdf-line';
    if (fileType.includes('image')) return 'ri:image-line';
    if (fileType.includes('word')) return 'ri:file-word-line';
    if (fileType.includes('excel')) return 'ri:file-excel-line';
    return 'ri:file-line';
  };

  // Show loading state
  if (documentsLoading || categoriesLoading) {
    return (
      <>
        <PageTitle
          title="Documents & Records"
          subName="Manage community documents, compliance, and record keeping"
        />
        <ComponentContainerCard title="Documents & Records Management" id="documents-records">
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading documents...</p>
          </div>
        </ComponentContainerCard>
      </>
    );
  }

  // Show error state
  if (documentsError) {
    return (
      <>
        <PageTitle
          title="Documents & Records"
          subName="Manage community documents, compliance, and record keeping"
        />
        <ComponentContainerCard title="Documents & Records Management" id="documents-records">
          <Alert variant="danger">
            <IconifyIcon icon="ri:error-warning-line" className="me-2" />
            Error loading documents: {documentsError.message}
          </Alert>
        </ComponentContainerCard>
      </>
    );
  }

  return (
    <>
      <PageTitle
        title="Documents & Records"
        subName="Manage community documents, compliance, and record keeping"
      />

      <ComponentContainerCard title="Documents & Records Management" id="documents-records">
        <Tabs defaultActiveKey="overview" className="mb-3">
          <Tab eventKey="overview" title="Overview">
            <Row className="mb-4">
              <Col xl={3} md={6}>
                <Card className="text-center">
                  <Card.Body>
                    <IconifyIcon icon="ri:file-list-3-line" className="display-6 text-primary mb-2" />
                    <h3 className="mb-1">{statistics.totalDocs}</h3>
                    <p className="text-muted mb-0">Total Documents</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={3} md={6}>
                <Card className="text-center">
                  <Card.Body>
                    <IconifyIcon icon="ri:check-line" className="display-6 text-success mb-2" />
                    <h3 className="mb-1">{statistics.activeDocs}</h3>
                    <p className="text-muted mb-0">Active Documents</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={3} md={6}>
                <Card className="text-center">
                  <Card.Body>
                    <IconifyIcon icon="ri:alarm-warning-line" className="display-6 text-warning mb-2" />
                    <h3 className="mb-1">{statistics.expiringDocs}</h3>
                    <p className="text-muted mb-0">Expiring Soon</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={3} md={6}>
                <Card className="text-center">
                  <Card.Body>
                    <IconifyIcon icon="ri:shield-line" className="display-6 text-danger mb-2" />
                    <h3 className="mb-1">{statistics.confidentialDocs}</h3>
                    <p className="text-muted mb-0">Confidential</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {statistics.pendingApproval > 0 && (
              <Alert variant="warning" className="mb-4">
                <IconifyIcon icon="ri:alert-line" className="me-2" />
                <strong>{statistics.pendingApproval}</strong> documents are pending approval.
              </Alert>
            )}

            <Row>
              {documentCategories.map((category) => (
                <Col lg={4} md={6} key={category.type} className="mb-3">
                  <Card className={`border-${category.color}`}>
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className={`avatar-sm bg-${category.color} bg-gradient rounded-circle me-3 d-flex align-items-center justify-content-center`}>
                          <IconifyIcon icon={category.icon} className="text-white" style={{ fontSize: '1.2rem' }} />
                        </div>
                        <div>
                          <h6 className="mb-1">{category.name}</h6>
                          <Badge bg={category.color}>{statistics.typeCounts[category.type] || 0} docs</Badge>
                        </div>
                      </div>
                      <p className="text-muted mb-3">{category.description}</p>
                      <div>
                        <small className="text-muted">Required Documents:</small>
                        <ul className="list-unstyled mt-1">
                          {category.required_docs.slice(0, 3).map((doc, index) => (
                            <li key={index} className="text-muted">
                              <small>• {doc}</small>
                            </li>
                          ))}
                          {category.required_docs.length > 3 && (
                            <li className="text-muted">
                              <small>• +{category.required_docs.length - 3} more</small>
                            </li>
                          )}
                        </ul>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Tab>

          <Tab eventKey="documents" title="Document Library">
            <Row className="mb-3">
              <Col lg={3}>
                <Form.Control
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col lg={2}>
                <Form.Select value={selectedCommunity} onChange={(e) => setSelectedCommunity(e.target.value)}>
                  <option value="all">All Communities</option>
                  {communityOptions.map((community) => (
                    <option key={community.value} value={community.value}>{community.label}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col lg={2}>
                <Form.Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="all">All Types</option>
                  {documentCategories.map(cat => (
                    <option key={cat.type} value={cat.type}>{cat.name}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col lg={2}>
                <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="expired">Expired</option>
                  <option value="draft">Draft</option>
                </Form.Select>
              </Col>
              <Col lg={3} className="text-end">
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                >
                  <IconifyIcon icon={viewMode === 'list' ? 'ri:layout-grid-line' : 'ri:list-unordered'} />
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => {
                    setEditingDocument(null);
                    reset();
                    setShowModal(true);
                  }}
                >
                  <IconifyIcon icon="ri:upload-line" className="me-1" />
                  Upload Document
                </Button>
              </Col>
            </Row>

            {viewMode === 'list' ? (
              <Card>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Document</th>
                          <th>Community</th>
                          <th>Type</th>
                          <th>Category</th>
                          <th>Size</th>
                          <th>Access Level</th>
                          <th>Upload Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedDocuments.map((document) => (
                          <tr key={document.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <IconifyIcon 
                                  icon={getFileIcon(document.file_type || 'application/pdf')} 
                                  className="text-primary me-2" 
                                  style={{ fontSize: '1.5rem' }}
                                />
                                <div>
                                  <div className="fw-bold">{document.title || document.name || 'Untitled'}</div>
                                  <small className="text-muted">{document.file_name || 'Unknown file'}</small>
                                  {document.is_confidential && (
                                    <Badge bg="danger" className="ms-2">Confidential</Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>{resolveCommunityName(document)}</td>
                            <td>
                              <Badge bg={getTypeBadge(document.document_type || document.type || 'other')}>
                                {(document.document_type || document.type || 'other').replace('_', ' ').toUpperCase()}
                              </Badge>
                            </td>
                            <td>{document.category || 'Unknown Category'}</td>
                            <td>{formatFileSize(document.file_size || 0)}</td>
                            <td>
                              <Badge bg={getAccessBadge(document.access_level || 'private')}>
                                {(document.access_level || 'private').replace('_', ' ').toUpperCase()}
                              </Badge>
                            </td>
                            <td>{document.upload_date ? new Date(document.upload_date).toLocaleDateString() : 'Unknown'}</td>
                            <td>
                              <Badge bg={getStatusBadge(document.status || 'active')}>
                                {(document.status || 'active').toUpperCase()}
                              </Badge>
                            </td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle variant="light" size="sm">
                                  <IconifyIcon icon="ri:more-2-line" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item>
                                    <IconifyIcon icon="ri:eye-line" className="me-1" />
                                    View
                                  </Dropdown.Item>
                                  <Dropdown.Item>
                                    <IconifyIcon icon="ri:download-line" className="me-1" />
                                    Download
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={() => handleEdit(document)}>
                                    <IconifyIcon icon="ri:edit-line" className="me-1" />
                                    Edit
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item 
                                    className="text-danger"
                                    onClick={() => {
                                      setDocumentToDelete(document.id);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                                    Delete
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Row>
                {paginatedDocuments.map((document) => (
                  <Col lg={4} md={6} key={document.id} className="mb-3">
                    <Card className="h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center">
                            <IconifyIcon 
                              icon={getFileIcon(document.file_type)} 
                              className="text-primary me-2" 
                              style={{ fontSize: '2rem' }}
                            />
                            <div>
                              <h6 className="mb-1">{document.title}</h6>
                              <small className="text-muted">{document.category}</small>
                            </div>
                          </div>
                          <Badge bg={getStatusBadge(document.status)}>
                            {document.status}
                          </Badge>
                        </div>
                        
                        <div className="mb-2">
                          <Badge bg={getTypeBadge(document.document_type)} className="me-2">
                            {document.document_type.replace('_', ' ')}
                          </Badge>
                          <Badge bg={getAccessBadge(document.access_level)}>
                            {document.access_level.replace('_', ' ')}
                          </Badge>
                          {document.is_confidential && (
                            <Badge bg="danger" className="ms-2">Confidential</Badge>
                          )}
                        </div>
                        
                        <div className="mb-3">
                          <small className="text-muted d-block">{resolveCommunityName(document)}</small>
                          <small className="text-muted d-block">{formatFileSize(document.file_size)}</small>
                          <small className="text-muted d-block">
                            Uploaded: {new Date(document.upload_date).toLocaleDateString()}
                          </small>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <Button variant="outline-primary" size="sm">
                            <IconifyIcon icon="ri:eye-line" />
                          </Button>
                          <Button variant="outline-secondary" size="sm">
                            <IconifyIcon icon="ri:download-line" />
                          </Button>
                          <Button variant="outline-info" size="sm" onClick={() => handleEdit(document)}>
                            <IconifyIcon icon="ri:edit-line" />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => {
                              setDocumentToDelete(document.id);
                              setShowDeleteModal(true);
                            }}
                          >
                            <IconifyIcon icon="ri:delete-bin-line" />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <Row className="mt-4">
                <Col xs={12}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                      <span className="text-muted">
                        Showing {showingFrom} to {showingTo} of {totalItems} documents
                      </span>
                      <div className="d-flex align-items-center gap-2">
                        <label className="text-muted mb-0">Items per page:</label>
                        <Form.Select
                          size="sm"
                          style={{ width: 'auto' }}
                          value={itemsPerPage}
                          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </Form.Select>
                      </div>
                    </div>
                    
                    {totalPages > 1 && (
                      <nav aria-label="Documents pagination">
                        <ul className="pagination pagination-sm mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              type="button"
                              className="page-link"
                              onClick={() => setCurrentPage(1)}
                              disabled={currentPage === 1}
                            >
                              <IconifyIcon icon="ri:skip-back-line" />
                            </button>
                          </li>
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              type="button"
                              className="page-link"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                            >
                              <IconifyIcon icon="ri:arrow-left-s-line" />
                            </button>
                          </li>
                          
                          {/* Page Numbers */}
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }
                            
                            return (
                              <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                                <button
                                  type="button"
                                  className="page-link"
                                  onClick={() => setCurrentPage(pageNumber)}
                                >
                                  {pageNumber}
                                </button>
                              </li>
                            );
                          })}
                          
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                              type="button"
                              className="page-link"
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                            >
                              <IconifyIcon icon="ri:arrow-right-s-line" />
                            </button>
                          </li>
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                              type="button"
                              className="page-link"
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={currentPage === totalPages}
                            >
                              <IconifyIcon icon="ri:skip-forward-line" />
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </div>
                </Col>
              </Row>
            )}
          </Tab>

          <Tab eventKey="compliance" title="Compliance Tracker">
            <Row>
              {documentCategories.map((category) => (
                <Col lg={6} key={category.type} className="mb-4">
                  <Card>
                    <Card.Header>
                      <div className="d-flex align-items-center">
                        <IconifyIcon icon={category.icon} className={`text-${category.color} me-2`} />
                        <h6 className="mb-0">{category.name}</h6>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Required Document</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.required_docs.map((reqDoc, index) => {
                              const exists = documents?.some(d => 
                                (d.document_type || d.type) === category.type && 
                                (d.category || '').toLowerCase().includes(reqDoc.toLowerCase())
                              ) || false;
                              return (
                                <tr key={index}>
                                  <td>{reqDoc}</td>
                                  <td>
                                    <Badge bg={exists ? 'success' : 'danger'}>
                                      {exists ? 'Available' : 'Missing'}
                                    </Badge>
                                  </td>
                                  <td>
                                    {!exists && (
                                      <Button variant="outline-primary" size="sm">
                                        <IconifyIcon icon="ri:upload-line" className="me-1" />
                                        Upload
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Tab>
        </Tabs>
      </ComponentContainerCard>

      {/* Upload/Edit Document Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingDocument ? 'Edit Document' : 'Upload New Document'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(handleCreateOrUpdate)}>
          <Modal.Body>
            {!editingDocument && (
              <Form.Group className="mb-3">
                <Form.Label>Select File *</Form.Label>
                <Form.Control 
                  type="file" 
                  onChange={(e) => setSelectedFiles((e.target as HTMLInputElement).files)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <Form.Text className="text-muted">
                  Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG (Max 10MB)
                </Form.Text>
              </Form.Group>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Community *</Form.Label>
                  <Form.Select {...register('community_id')} isInvalid={!!errors.community_id}>
                    <option value="">Select Community</option>
                    {communityOptions.map((community) => (
                      <option key={community.value} value={community.value}>{community.label}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.community_id?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Document Type *</Form.Label>
                  <Form.Select {...register('document_type')} isInvalid={!!errors.document_type}>
                    <option value="">Select Type</option>
                    {documentCategories.map(cat => (
                      <option key={cat.type} value={cat.type}>{cat.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.document_type?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Control {...register('category')} isInvalid={!!errors.category} />
                  <Form.Control.Feedback type="invalid">{errors.category?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control {...register('title')} isInvalid={!!errors.title} />
                  <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} {...register('description')} />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Access Level *</Form.Label>
                  <Form.Select {...register('access_level')} isInvalid={!!errors.access_level}>
                    <option value="">Select Access Level</option>
                    <option value="public">Public</option>
                    <option value="residents">Residents Only</option>
                    <option value="committee">Committee Only</option>
                    <option value="admin_only">Admin Only</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.access_level?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select {...register('status')} isInvalid={!!errors.status}>
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.status?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control type="date" {...register('expiry_date')} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Version</Form.Label>
                  <Form.Control {...register('version')} placeholder="e.g., 1.0" />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  id="is_confidential"
                  label="Mark as Confidential"
                  {...register('is_confidential')}
                />
              </Col>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  id="approval_required"
                  label="Requires Approval"
                  {...register('approval_required')}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editingDocument ? 'Update' : 'Upload'} Document
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this document? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DocumentsRecords;
