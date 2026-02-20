"use client";

import React, { useState } from 'react';
import { Row, Col, Card, Button, Badge, Nav, Spinner } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Components
import MarketplaceMetricCard from './components/MarketplaceMetricCard';
import CategoryManagementTable from './components/CategoryManagementTable';
import ProductManagementTable from './components/ProductManagementTable';
import OrderManagementTable from './components/OrderManagementTable';
import VendorManagementTable from './components/VendorManagementTable';
import ReviewManagementTable from './components/ReviewManagementTable';
import PromotionManagementTable from './components/PromotionManagementTable';
import MarketplaceSalesChart from './components/MarketplaceSalesChart';
import ProductPerformanceChart from './components/ProductPerformanceChart';
import AddCategoryModal from './components/AddCategoryModal';
import AddProductModal from './components/AddProductModal';
import AddVendorModal from './components/AddVendorModal';
import CreatePromotionModal from './components/CreatePromotionModal';
import VisualContentManagement from './components/VisualContentManagement';
// Hook
import { useMarketplaceService } from '@/hooks/useMarketplaceService';

const MarketplacePage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'products' | 'orders' | 'vendors' | 'reviews' | 'promotions' | 'visual-content'>('overview');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [showCreatePromotionModal, setShowCreatePromotionModal] = useState(false);
  const [editPromotion, setEditPromotion] = useState(null);

  // Fetch metrics from database
  const { metrics, providers, loading, error } = useMarketplaceService();

  // Format helpers
  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `₦${num.toLocaleString()}`;

  // Sample parent categories for the modal
  const parentCategories = [
    { id: 'cat-001', name: 'Electronics' },
    { id: 'cat-002', name: 'Fashion' },
    { id: 'cat-003', name: 'Home & Kitchen' },
    { id: 'cat-004', name: 'Beauty & Personal Care' },
    { id: 'cat-005', name: 'Sports & Outdoors' }
  ];

  // Sample vendors for the product modal
  const vendors = [
    { id: 'vendor-001', name: 'Tech Solutions Ltd' },
    { id: 'vendor-002', name: 'Fashion Forward' },
    { id: 'vendor-003', name: 'Home Essentials' },
    { id: 'vendor-004', name: 'Beauty World' },
    { id: 'vendor-005', name: 'Sports Central' }
  ];

  return (
    <>
      <PageTitle title="Marketplace" subName="Management Dashboard" />

      {/* Top navigation tabs */}
      <Card className="mb-3">
        <Card.Body className="p-0">
          <Nav
            variant="tabs"
            className="nav-bordered"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k as any)}
          >
            <Nav.Item>
              <Nav.Link eventKey="overview">
                <IconifyIcon icon="ri:dashboard-line" className="me-1" /> Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="categories">
                <IconifyIcon icon="ri:folder-chart-line" className="me-1" /> Categories
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="products">
                <IconifyIcon icon="ri:shopping-bag-3-line" className="me-1" /> Products
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="orders">
                <IconifyIcon icon="ri:shopping-cart-2-line" className="me-1" /> Orders
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="vendors">
                <IconifyIcon icon="ri:store-2-line" className="me-1" /> Vendors
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="reviews">
                <IconifyIcon icon="ri:star-line" className="me-1" /> Reviews
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="promotions">
                <IconifyIcon icon="ri:coupon-line" className="me-1" /> Promotions
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="visual-content">
                <IconifyIcon icon="ri:image-2-line" className="me-1" /> Visual Content
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>

      {activeTab === 'overview' && (
        <>
          {/* Key metrics */}
          {loading ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <Row>
              <Col xl={3} md={6}>
                <MarketplaceMetricCard
                  title="Total Orders"
                  value={formatNumber(metrics?.totalTransactions || 0)}
                  growth={`+${metrics?.growth?.transactions || 0}%`}
                  icon="ri:shopping-cart-2-line"
                  variant="primary"
                />
              </Col>
              <Col xl={3} md={6}>
                <MarketplaceMetricCard
                  title="Revenue"
                  value={formatCurrency(metrics?.revenue || 0)}
                  growth={`+${metrics?.growth?.revenue || 0}%`}
                  icon="ri:money-dollar-circle-line"
                  variant="success"
                />
              </Col>
              <Col xl={3} md={6}>
                <MarketplaceMetricCard
                  title="Success Rate"
                  value={`${(metrics?.successRate || 0).toFixed(1)}%`}
                  growth={`+${metrics?.growth?.successRate || 0}%`}
                  icon="ri:shopping-bag-3-line"
                  variant="info"
                />
              </Col>
              <Col xl={3} md={6}>
                <MarketplaceMetricCard
                  title="Active Providers"
                  value={String(metrics?.activeProviders || 0)}
                  growth="0%"
                  icon="ri:star-line"
                  variant="warning"
                />
              </Col>
            </Row>
          )}

          {/* Charts and analytics */}
          <Row>
            <Col xl={8}>
              <MarketplaceSalesChart />
            </Col>
            <Col xl={4}>
              <ProductPerformanceChart />
            </Col>
          </Row>

          {/* Recent orders and top products */}
          <Row>
            <Col xl={6}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <Card.Title className="mb-0">Recent Orders</Card.Title>
                  <Button
                    variant="link"
                    className="p-0 ms-auto"
                    onClick={() => setActiveTab('orders')}
                  >
                    View All <IconifyIcon icon="ri:arrow-right-line" />
                  </Button>
                </Card.Header>
                <Card.Body>
                  <OrderManagementTable limit={5} />
                </Card.Body>
              </Card>
            </Col>
            <Col xl={6}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <Card.Title className="mb-0">Top Products</Card.Title>
                  <Button
                    variant="link"
                    className="p-0 ms-auto"
                    onClick={() => setActiveTab('products')}
                  >
                    View All <IconifyIcon icon="ri:arrow-right-line" />
                  </Button>
                </Card.Header>
                <Card.Body>
                  <ProductManagementTable limit={5} sortBy="sales" />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent reviews */}
          <Card>
            <Card.Header className="d-flex align-items-center">
              <Card.Title className="mb-0">Recent Reviews</Card.Title>
              <Button
                variant="link"
                className="p-0 ms-auto"
                onClick={() => setActiveTab('reviews')}
              >
                View All <IconifyIcon icon="ri:arrow-right-line" />
              </Button>
            </Card.Header>
            <Card.Body>
              <ReviewManagementTable limit={5} />
            </Card.Body>
          </Card>
        </>
      )}

      {activeTab === 'categories' && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Category Management</Card.Title>
            <Button
              variant="primary"
              size="sm"
              className="ms-auto"
              onClick={() => {
                setEditCategory(null);
                setShowAddCategoryModal(true);
              }}
            >
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Add Category
            </Button>
          </Card.Header>
          <Card.Body>
            <CategoryManagementTable />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'products' && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Product Management</Card.Title>
            <Button
              variant="primary"
              size="sm"
              className="ms-auto"
              onClick={() => {
                setEditProduct(null);
                setShowAddProductModal(true);
              }}
            >
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Add Product
            </Button>
          </Card.Header>
          <Card.Body>
            <ProductManagementTable showFilters={true} />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'orders' && (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Order Management</Card.Title>
          </Card.Header>
          <Card.Body>
            <OrderManagementTable showFilters={true} />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'vendors' && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Vendor Management</Card.Title>
            <Button
              variant="primary"
              size="sm"
              className="ms-auto"
              onClick={() => {
                setEditVendor(null);
                setShowAddVendorModal(true);
              }}
            >
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Add Vendor
            </Button>
          </Card.Header>
          <Card.Body>
            <VendorManagementTable />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'reviews' && (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Review Management</Card.Title>
          </Card.Header>
          <Card.Body>
            <ReviewManagementTable showFilters={true} />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'promotions' && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Promotion Management</Card.Title>
            <Button
              variant="primary"
              size="sm"
              className="ms-auto"
              onClick={() => {
                setEditPromotion(null);
                setShowCreatePromotionModal(true);
              }}
            >
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Create Promotion
            </Button>
          </Card.Header>
          <Card.Body>
            <PromotionManagementTable showFilters={true} />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'visual-content' && (
        <VisualContentManagement />
      )}

      {/* Add/Edit Category Modal */}
      <AddCategoryModal
        show={showAddCategoryModal}
        onHide={() => setShowAddCategoryModal(false)}
        onSave={handleSaveCategory}
        editCategory={editCategory}
        parentCategories={parentCategories}
      />

      {/* Add/Edit Product Modal */}
      <AddProductModal
        show={showAddProductModal}
        onHide={() => setShowAddProductModal(false)}
        onSave={handleSaveProduct}
        editProduct={editProduct}
        categories={parentCategories}
        vendors={vendors}
      />

      {/* Add/Edit Vendor Modal */}
      <AddVendorModal
        show={showAddVendorModal}
        onHide={() => setShowAddVendorModal(false)}
        onSave={handleSaveVendor}
        editVendor={editVendor}
      />

      {/* Create/Edit Promotion Modal */}
      <CreatePromotionModal
        show={showCreatePromotionModal}
        onHide={() => setShowCreatePromotionModal(false)}
        onSave={handleSavePromotion}
        editPromotion={editPromotion}
      />
    </>
  );

  // Handler for saving category data
  function handleSaveCategory(categoryData: any) {
    // In a real application, this would call an API to save the category
    console.log('Saving category data:', categoryData);

    // For now, just show a success message
    alert(editCategory
      ? `Category ${categoryData.name} updated successfully!`
      : `Category ${categoryData.name} added successfully!`
    );
  }

  // Handler for saving product data
  function handleSaveProduct(productData: any) {
    // In a real application, this would call an API to save the product
    console.log('Saving product data:', productData);

    // For now, just show a success message
    alert(editProduct
      ? `Product ${productData.name} updated successfully!`
      : `Product ${productData.name} added successfully!`
    );
  }

  // Handler for saving vendor data
  function handleSaveVendor(vendorData: any) {
    // In a real application, this would call an API to save the vendor
    console.log('Saving vendor data:', vendorData);

    // For now, just show a success message
    alert(editVendor
      ? `Vendor ${vendorData.name} updated successfully!`
      : `Vendor ${vendorData.name} added successfully!`
    );
  }

  // Handler for saving promotion data
  function handleSavePromotion(promotionData: any) {
    // In a real application, this would call an API to save the promotion
    console.log('Saving promotion data:', promotionData);

    // For now, just show a success message
    alert(editPromotion
      ? `Promotion ${promotionData.name} updated successfully!`
      : `Promotion ${promotionData.name} created successfully!`
    );
  }
};

export default MarketplacePage;
