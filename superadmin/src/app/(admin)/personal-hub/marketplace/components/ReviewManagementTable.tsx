'use client';

import { useMemo, useState } from 'react';
import { Badge, Dropdown, Form, InputGroup, Spinner, Table } from 'react-bootstrap';

import type { MarketplaceReviewView } from '@/hooks/useMarketplaceWorkspace';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface ReviewManagementTableProps {
  reviews: MarketplaceReviewView[];
  loading?: boolean;
  showFilters?: boolean;
  limit?: number;
  onToggleActive: (review: MarketplaceReviewView) => void;
}

const renderStars = (rating: number) => Array.from({ length: 5 }, (_, index) => (
  <IconifyIcon
    key={`${rating}-${index}`}
    icon={index < rating ? 'ri:star-fill' : 'ri:star-line'}
    className={index < rating ? 'text-warning' : 'text-muted'}
  />
));

const ReviewManagementTable = ({ reviews, loading = false, showFilters = false, limit, onToggleActive }: ReviewManagementTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'published' | 'hidden'>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  const filteredReviews = useMemo(() => {
    const visible = reviews.filter((review) => {
      const matchesSearch = [review.product_name || '', review.customer_name || '', review.customer_email || '', review.review_text || '']
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesVisibility = visibilityFilter === 'all'
        ? true
        : visibilityFilter === 'published'
          ? Boolean(review.is_active)
          : !review.is_active;
      const matchesRating = ratingFilter === 'all' || review.rating === Number(ratingFilter);
      return matchesSearch && matchesVisibility && matchesRating;
    });

    return limit ? visible.slice(0, limit) : visible;
  }, [limit, ratingFilter, reviews, searchTerm, visibilityFilter]);

  if (loading) {
    return <div className="py-4 text-center"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      {showFilters ? (
        <div className="d-flex flex-wrap gap-2 mb-3">
          <div className="flex-grow-1">
            <InputGroup>
              <InputGroup.Text><IconifyIcon icon="ri:search-line" /></InputGroup.Text>
              <Form.Control placeholder="Search reviews..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            </InputGroup>
          </div>
          <Form.Select style={{ width: 'auto' }} value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value as 'all' | 'published' | 'hidden')}>
            <option value="all">All visibility</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
          </Form.Select>
          <Form.Select style={{ width: 'auto' }} value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}>
            <option value="all">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </Form.Select>
        </div>
      ) : null}

      <div className="table-responsive">
        <Table className="table-centered mb-0">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Date</th>
              <th>Purchase</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((review) => (
              <tr key={review.id}>
                <td>{review.product_name || 'Unassigned product'}</td>
                <td>
                  <div>{review.customer_name || 'Resident'}</div>
                  <div className="text-muted small">{review.customer_email || review.user_id || 'No contact record'}</div>
                </td>
                <td><div className="d-flex gap-1">{renderStars(review.rating)}</div></td>
                <td>
                  <div className="text-truncate" style={{ maxWidth: 280 }}>{review.review_text || 'No written review provided.'}</div>
                </td>
                <td>{review.created_at ? new Date(review.created_at).toLocaleDateString() : '—'}</td>
                <td>
                  <Badge bg={review.is_verified_purchase ? 'info' : 'light'} text={review.is_verified_purchase ? undefined : 'dark'}>
                    {review.is_verified_purchase ? 'Verified purchase' : 'Unverified'}
                  </Badge>
                </td>
                <td>
                  <Badge bg={review.is_active ? 'success' : 'secondary'}>
                    {review.is_active ? 'Published' : 'Hidden'}
                  </Badge>
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" size="sm"><IconifyIcon icon="ri:more-2-fill" /></Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => onToggleActive(review)}>
                        <IconifyIcon icon={review.is_active ? 'ri:eye-off-line' : 'ri:eye-line'} className="me-1" />
                        {review.is_active ? 'Hide Review' : 'Publish Review'}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-muted">No marketplace reviews found.</td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ReviewManagementTable;
