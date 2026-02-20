"use client";

import React, { useState } from 'react';
import { Table, Form, InputGroup, Button, Badge, Dropdown, Image } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface ReviewManagementTableProps {
  showFilters?: boolean;
  limit?: number;
}

// Review status types and their corresponding styles
const REVIEW_STATUS = {
  approved: { variant: 'success', icon: 'ri:check-line' },
  pending: { variant: 'warning', icon: 'ri:time-line' },
  rejected: { variant: 'danger', icon: 'ri:close-circle-line' },
  flagged: { variant: 'info', icon: 'ri:flag-line' },
};

type ReviewStatusType = keyof typeof REVIEW_STATUS;

interface Review {
  id: string;
  product: string;
  productImage: string;
  customer: string;
  customerImage: string;
  rating: number;
  comment: string;
  date: string;
  status: ReviewStatusType;
}

const DEMO_REVIEWS: Review[] = [
  {
    id: '1',
    product: 'Wireless Bluetooth Headphones',
    productImage: '/assets/images/products/product-1.jpg', // Using placeholder
    customer: 'John Doe',
    customerImage: '/assets/images/users/avatar-1.jpg',
    rating: 5,
    comment: 'Amazing sound quality and battery life! Would definitely recommend these to anyone.',
    date: '2023-09-15',
    status: 'approved'
  },
  {
    id: '2',
    product: 'Smartphone X Pro',
    productImage: '/assets/images/products/product-2.jpg',
    customer: 'Sarah Johnson',
    customerImage: '/assets/images/users/avatar-2.jpg',
    rating: 4,
    comment: 'Good phone with great camera but battery life could be better.',
    date: '2023-09-16',
    status: 'pending'
  },
  {
    id: '3',
    product: 'Smart Watch Series 5',
    productImage: '/assets/images/products/product-3.jpg',
    customer: 'Michael Brown',
    customerImage: '/assets/images/users/avatar-3.jpg',
    rating: 2,
    comment: 'This watch doesn\'t work as advertised. Very disappointed with my purchase.',
    date: '2023-09-16',
    status: 'flagged'
  },
  {
    id: '4',
    product: 'Portable Power Bank 20000mAh',
    productImage: '/assets/images/products/product-4.jpg',
    customer: 'Emily Wilson',
    customerImage: '/assets/images/users/avatar-4.jpg',
    rating: 5,
    comment: 'Perfect power bank for travel! Charges my devices multiple times.',
    date: '2023-09-17',
    status: 'approved'
  },
  {
    id: '5',
    product: 'Gaming Keyboard RGB',
    productImage: '/assets/images/products/product-5.jpg',
    customer: 'David Thompson',
    customerImage: '/assets/images/users/avatar-5.jpg',
    rating: 1,
    comment: 'This is a terrible product. Keys stopped working after one week.',
    date: '2023-09-15',
    status: 'rejected'
  },
  {
    id: '6',
    product: 'HD Webcam 1080p',
    productImage: '/assets/images/products/product-6.jpg',
    customer: 'Lisa Martinez',
    customerImage: '/assets/images/users/avatar-6.jpg',
    rating: 4,
    comment: 'Good quality video for the price point. Easy to set up too.',
    date: '2023-09-14',
    status: 'pending'
  }
];

const ReviewManagementTable: React.FC<ReviewManagementTableProps> = ({ 
  showFilters = false,
  limit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  
  // Filter reviews based on search term, status, and rating
  const filteredReviews = DEMO_REVIEWS.filter(review => {
    const matchesSearch = 
      review.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  // Apply limit if provided
  const displayReviews = limit ? filteredReviews.slice(0, limit) : filteredReviews;

  const handleUpdateStatus = (reviewId: string, newStatus: ReviewStatusType) => {
    // This would update the review status
    console.log(`Update review ${reviewId} status to: ${newStatus}`);
  };

  // Function to render stars for ratings
  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <IconifyIcon key={i} icon="ri:star-fill" className="text-warning" />
        );
      } else {
        stars.push(
          <IconifyIcon key={i} icon="ri:star-line" className="text-muted" />
        );
      }
    }
    return stars;
  };

  return (
    <div>
      {showFilters && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          <div className="flex-grow-1">
            <InputGroup>
              <InputGroup.Text>
                <IconifyIcon icon="ri:search-line" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          
          <Form.Select 
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </Form.Select>
          
          <Form.Select 
            style={{ width: 'auto' }}
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </Form.Select>
          
          <Button variant="outline-secondary">
            <IconifyIcon icon="ri:download-2-line" className="me-1" />
            Export
          </Button>
        </div>
      )}
      
      <div className="table-responsive">
        <Table className="table-centered mb-0">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayReviews.map((review) => (
              <tr key={review.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      <Image 
                        src={review.productImage} 
                        alt={review.product} 
                        width={40} 
                        height={40} 
                      />
                    </div>
                    <div>
                      <p className="m-0">{review.product}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      <Image 
                        src={review.customerImage} 
                        alt={review.customer} 
                        width={32} 
                        height={32} 
                        roundedCircle 
                      />
                    </div>
                    <div>
                      {review.customer}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex">
                    {renderRatingStars(review.rating)}
                  </div>
                </td>
                <td>
                  <p className="m-0 text-truncate" style={{ maxWidth: '200px' }}>
                    {review.comment}
                  </p>
                </td>
                <td>{review.date}</td>
                <td>
                  <Badge bg={REVIEW_STATUS[review.status].variant} className="px-2 py-1">
                    <IconifyIcon icon={REVIEW_STATUS[review.status].icon} className="me-1" />
                    {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                  </Badge>
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" size="sm" className="btn-sm">
                      <IconifyIcon icon="ri:more-2-fill" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View Full Review
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:reply-line" className="me-1" />
                        Reply to Review
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Header>Update Status</Dropdown.Header>
                      <Dropdown.Item 
                        onClick={() => handleUpdateStatus(review.id, 'approved')}
                        className={review.status === 'approved' ? 'disabled' : ''}
                      >
                        <IconifyIcon icon="ri:check-line" className="me-1 text-success" />
                        Approve
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleUpdateStatus(review.id, 'rejected')}
                        className={review.status === 'rejected' ? 'disabled' : ''}
                      >
                        <IconifyIcon icon="ri:close-circle-line" className="me-1 text-danger" />
                        Reject
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleUpdateStatus(review.id, 'flagged')}
                        className={review.status === 'flagged' ? 'disabled' : ''}
                      >
                        <IconifyIcon icon="ri:flag-line" className="me-1 text-info" />
                        Flag for Review
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      {!limit && displayReviews.length > 0 && (
        <div className="d-flex align-items-center justify-content-between mt-3">
          <div>
            Showing 1-{displayReviews.length} of {filteredReviews.length} reviews
          </div>
          <div>
            <Button variant="outline-primary" size="sm" className="me-1">Previous</Button>
            <Button variant="outline-primary" size="sm">Next</Button>
          </div>
        </div>
      )}
      
      {displayReviews.length === 0 && (
        <div className="text-center py-4">
          <IconifyIcon icon="ri:chat-1-line" width={40} height={40} className="text-muted" />
          <p className="mt-2">No reviews found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default ReviewManagementTable;
