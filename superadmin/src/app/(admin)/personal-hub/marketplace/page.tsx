'use client';

import { useState } from 'react';
import { Alert, Button, Card, Col, Nav, Row, Spinner } from 'react-bootstrap';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useMarketplaceWorkspace, type MarketplaceCategoryView, type MarketplaceProductView, type MarketplaceVendorView, type MarketplaceOrderView, type MarketplaceReviewView } from '@/hooks/useMarketplaceWorkspace';

import MarketplaceMetricCard from './components/MarketplaceMetricCard';
import CategoryManagementTable from './components/CategoryManagementTable';
import ProductManagementTable from './components/ProductManagementTable';
import OrderManagementTable from './components/OrderManagementTable';
import VendorManagementTable from './components/VendorManagementTable';
import ReviewManagementTable from './components/ReviewManagementTable';
import MarketplaceSalesChart from './components/MarketplaceSalesChart';
import ProductPerformanceChart from './components/ProductPerformanceChart';
import AddCategoryModal from './components/AddCategoryModal';
import AddProductModal from './components/AddProductModal';
import AddVendorModal from './components/AddVendorModal';
import MarketplaceReadinessNotice from './components/MarketplaceReadinessNotice';

type MarketplaceTab = 'overview' | 'categories' | 'products' | 'orders' | 'vendors' | 'reviews' | 'promotions' | 'visual-content';

type FlashState = {
  variant: 'success' | 'danger' | 'warning' | 'info';
  message: string;
} | null;

const formatNumber = (value: number) => value.toLocaleString();
const formatCurrency = (value: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value || 0);

const MarketplacePage = () => {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('overview');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [editCategory, setEditCategory] = useState<MarketplaceCategoryView | null>(null);
  const [editProduct, setEditProduct] = useState<MarketplaceProductView | null>(null);
  const [editVendor, setEditVendor] = useState<MarketplaceVendorView | null>(null);
  const [flash, setFlash] = useState<FlashState>(null);

  const {
    categories,
    products,
    vendors,
    orders,
    reviews,
    metrics,
    loading,
    saving,
    error,
    createCategory,
    updateCategory,
    createProduct,
    updateProduct,
    createVendor,
    updateVendor,
    updateOrderStatus,
    updateReviewVisibility,
  } = useMarketplaceWorkspace();

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      await action();
      setFlash({ variant: 'success', message: successMessage });
    } catch (actionError) {
      setFlash({
        variant: 'danger',
        message: actionError instanceof Error ? actionError.message : 'Marketplace action failed.',
      });
    }
  };

  const handleSaveCategory = async (payload: Parameters<typeof createCategory>[0]) => {
    await runAction(
      () => editCategory ? updateCategory(editCategory.id, payload) : createCategory(payload),
      editCategory ? `Category ${payload.name} was updated.` : `Category ${payload.name} was created.`
    );
  };

  const handleSaveProduct = async (payload: Parameters<typeof createProduct>[0]) => {
    await runAction(
      () => editProduct ? updateProduct(editProduct.id, payload) : createProduct(payload),
      editProduct ? `Product ${payload.name} was updated.` : `Product ${payload.name} was created.`
    );
  };

  const handleSaveVendor = async (payload: Parameters<typeof createVendor>[0]) => {
    await runAction(
      () => editVendor ? updateVendor(editVendor.id, payload) : createVendor(payload),
      editVendor ? `Vendor ${payload.store_name} was updated.` : `Vendor ${payload.store_name} was created.`
    );
  };

  const handleOrderStatusUpdate = async (order: MarketplaceOrderView, nextStatus: string) => {
    await runAction(
      () => updateOrderStatus(order.id, nextStatus),
      `Order ${order.order_number} moved to ${nextStatus.replace(/_/g, ' ')}.`
    );
  };

  const handleReviewVisibility = async (review: MarketplaceReviewView) => {
    await runAction(
      () => updateReviewVisibility(review.id, !review.is_active),
      !review.is_active ? 'Review published.' : 'Review hidden.'
    );
  };

  const renderFlash = () => flash ? (
    <Alert variant={flash.variant} dismissible onClose={() => setFlash(null)}>
      {flash.message}
    </Alert>
  ) : null;

  return (
    <>
      <PageTitle title="Marketplace" subName="Management Dashboard" />

      <Card className="mb-3">
        <Card.Body className="p-0">
          <Nav variant="tabs" className="nav-bordered" activeKey={activeTab} onSelect={(key) => setActiveTab((key || 'overview') as MarketplaceTab)}>
            <Nav.Item><Nav.Link eventKey="overview"><IconifyIcon icon="ri:dashboard-line" className="me-1" /> Overview</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="categories"><IconifyIcon icon="ri:folder-chart-line" className="me-1" /> Categories</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="products"><IconifyIcon icon="ri:shopping-bag-3-line" className="me-1" /> Products</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="orders"><IconifyIcon icon="ri:shopping-cart-2-line" className="me-1" /> Orders</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="vendors"><IconifyIcon icon="ri:store-2-line" className="me-1" /> Vendors</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="reviews"><IconifyIcon icon="ri:star-line" className="me-1" /> Reviews</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="promotions"><IconifyIcon icon="ri:coupon-line" className="me-1" /> Promotions</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="visual-content"><IconifyIcon icon="ri:image-2-line" className="me-1" /> Visual Content</Nav.Link></Nav.Item>
          </Nav>
        </Card.Body>
      </Card>

      {renderFlash()}
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {saving ? <Alert variant="info">Marketplace changes are being saved.</Alert> : null}

      {activeTab === 'overview' ? (
        loading ? (
          <div className="text-center py-5"><Spinner animation="border" /></div>
        ) : (
          <>
            <Row>
              <Col xl={3} md={6}>
                <MarketplaceMetricCard title="Total Orders" value={formatNumber(metrics.totalOrders)} growth={`${metrics.growth.orders >= 0 ? '+' : ''}${metrics.growth.orders}%`} icon="ri:shopping-cart-2-line" variant="primary" />
              </Col>
              <Col xl={3} md={6}>
                <MarketplaceMetricCard title="GMV" value={formatCurrency(metrics.grossMerchandiseValue)} growth={`${metrics.growth.revenue >= 0 ? '+' : ''}${metrics.growth.revenue}%`} icon="ri:money-dollar-circle-line" variant="success" />
              </Col>
              <Col xl={3} md={6}>
                <MarketplaceMetricCard title="Fulfillment Rate" value={`${metrics.fulfillmentRate.toFixed(1)}%`} growth={`${metrics.growth.fulfillmentRate >= 0 ? '+' : ''}${metrics.growth.fulfillmentRate}%`} icon="ri:checkbox-circle-line" variant="info" />
              </Col>
              <Col xl={3} md={6}>
                <MarketplaceMetricCard title="Active Vendors" value={String(metrics.activeVendors)} growth="0%" icon="ri:store-3-line" variant="warning" />
              </Col>
            </Row>
            <Row>
              <Col xl={8}><MarketplaceSalesChart orders={orders} /></Col>
              <Col xl={4}><ProductPerformanceChart products={products} /></Col>
            </Row>
            <Row>
              <Col xl={6}>
                <Card>
                  <Card.Header className="d-flex align-items-center">
                    <Card.Title className="mb-0">Recent Orders</Card.Title>
                    <Button variant="link" className="p-0 ms-auto" onClick={() => setActiveTab('orders')}>View All <IconifyIcon icon="ri:arrow-right-line" /></Button>
                  </Card.Header>
                  <Card.Body>
                    <OrderManagementTable orders={orders} loading={loading} limit={5} onUpdateStatus={handleOrderStatusUpdate} />
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={6}>
                <Card>
                  <Card.Header className="d-flex align-items-center">
                    <Card.Title className="mb-0">Top Products</Card.Title>
                    <Button variant="link" className="p-0 ms-auto" onClick={() => setActiveTab('products')}>View All <IconifyIcon icon="ri:arrow-right-line" /></Button>
                  </Card.Header>
                  <Card.Body>
                    <ProductManagementTable products={products} loading={loading} limit={5} sortBy="sales" onEdit={(product) => { setEditProduct(product); setShowAddProductModal(true); }} onToggleActive={(product) => void runAction(() => updateProduct(product.id, { is_active: !product.is_active }), product.is_active ? `Product ${product.name} deactivated.` : `Product ${product.name} activated.`)} onToggleFeatured={(product) => void runAction(() => updateProduct(product.id, { is_featured: !product.is_featured }), product.is_featured ? `Product ${product.name} removed from featured.` : `Product ${product.name} marked as featured.`)} />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Card>
              <Card.Header className="d-flex align-items-center">
                <Card.Title className="mb-0">Recent Reviews</Card.Title>
                <Button variant="link" className="p-0 ms-auto" onClick={() => setActiveTab('reviews')}>View All <IconifyIcon icon="ri:arrow-right-line" /></Button>
              </Card.Header>
              <Card.Body>
                <ReviewManagementTable reviews={reviews} loading={loading} limit={5} onToggleActive={handleReviewVisibility} />
              </Card.Body>
            </Card>
          </>
        )
      ) : null}

      {activeTab === 'categories' ? (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Category Management</Card.Title>
            <Button variant="primary" size="sm" className="ms-auto" onClick={() => { setEditCategory(null); setShowAddCategoryModal(true); }}>
              <IconifyIcon icon="ri:add-line" className="me-1" /> Add Category
            </Button>
          </Card.Header>
          <Card.Body>
            <CategoryManagementTable categories={categories} loading={loading} showFilters onEdit={(category) => { setEditCategory(category); setShowAddCategoryModal(true); }} onToggleActive={(category) => void runAction(() => updateCategory(category.id, { is_active: !category.is_active }), category.is_active ? `Category ${category.name} deactivated.` : `Category ${category.name} activated.`)} />
          </Card.Body>
        </Card>
      ) : null}

      {activeTab === 'products' ? (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Product Management</Card.Title>
            <Button variant="primary" size="sm" className="ms-auto" onClick={() => { setEditProduct(null); setShowAddProductModal(true); }}>
              <IconifyIcon icon="ri:add-line" className="me-1" /> Add Product
            </Button>
          </Card.Header>
          <Card.Body>
            <ProductManagementTable products={products} loading={loading} showFilters onEdit={(product) => { setEditProduct(product); setShowAddProductModal(true); }} onToggleActive={(product) => void runAction(() => updateProduct(product.id, { is_active: !product.is_active }), product.is_active ? `Product ${product.name} deactivated.` : `Product ${product.name} activated.`)} onToggleFeatured={(product) => void runAction(() => updateProduct(product.id, { is_featured: !product.is_featured }), product.is_featured ? `Product ${product.name} removed from featured.` : `Product ${product.name} marked as featured.`)} />
          </Card.Body>
        </Card>
      ) : null}

      {activeTab === 'orders' ? (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Order Management</Card.Title>
          </Card.Header>
          <Card.Body>
            <OrderManagementTable orders={orders} loading={loading} showFilters onUpdateStatus={handleOrderStatusUpdate} />
          </Card.Body>
        </Card>
      ) : null}

      {activeTab === 'vendors' ? (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Vendor Management</Card.Title>
            <Button variant="primary" size="sm" className="ms-auto" onClick={() => { setEditVendor(null); setShowAddVendorModal(true); }}>
              <IconifyIcon icon="ri:add-line" className="me-1" /> Add Vendor
            </Button>
          </Card.Header>
          <Card.Body>
            <VendorManagementTable vendors={vendors} loading={loading} showFilters onEdit={(vendor) => { setEditVendor(vendor); setShowAddVendorModal(true); }} onToggleActive={(vendor) => void runAction(() => updateVendor(vendor.id, { is_active: !vendor.is_active }), vendor.is_active ? `Vendor ${vendor.store_name} deactivated.` : `Vendor ${vendor.store_name} activated.`)} onToggleVerified={(vendor) => void runAction(() => updateVendor(vendor.id, { is_verified: !vendor.is_verified }), vendor.is_verified ? `Vendor ${vendor.store_name} verification removed.` : `Vendor ${vendor.store_name} verified.`)} />
          </Card.Body>
        </Card>
      ) : null}

      {activeTab === 'reviews' ? (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Review Management</Card.Title>
          </Card.Header>
          <Card.Body>
            <ReviewManagementTable reviews={reviews} loading={loading} showFilters onToggleActive={handleReviewVisibility} />
          </Card.Body>
        </Card>
      ) : null}

      {activeTab === 'promotions' ? (
        <MarketplaceReadinessNotice
          title="Promotions are not yet wired"
          reason="This deployment does not have a live promotions table or fulfillment logic behind the marketplace workspace. Leaving the old simulated promotion controls active would mislead operators."
          items={[
            'Create schema-backed promotion entities before enabling discount and coupon management.',
            'Link promotions to actual marketplace checkout and order settlement rules.',
            'Expose promotion status, usage, and budget data from live records only.',
          ]}
        />
      ) : null}

      {activeTab === 'visual-content' ? (
        <MarketplaceReadinessNotice
          title="Visual merchandising is in planning state"
          reason="Hero banners, featured sections, and promotional placements are not backed by a live content model in this deployment. The previous screen was fully mock data."
          items={[
            'Define live marketplace merchandising tables before enabling content actions.',
            'Connect assets to the user marketplace home surfaces and ordering rules.',
            'Track impressions and clicks from real runtime events before exposing analytics.',
          ]}
        />
      ) : null}

      <AddCategoryModal show={showAddCategoryModal} onHide={() => setShowAddCategoryModal(false)} onSave={handleSaveCategory} editCategory={editCategory} />
      <AddProductModal show={showAddProductModal} onHide={() => setShowAddProductModal(false)} onSave={handleSaveProduct} editProduct={editProduct} categories={categories} vendors={vendors} />
      <AddVendorModal show={showAddVendorModal} onHide={() => setShowAddVendorModal(false)} onSave={handleSaveVendor} editVendor={editVendor} />
    </>
  );
};

export default MarketplacePage;
