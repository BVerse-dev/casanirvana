'use client';

import { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

interface ApiResponse {
  success: boolean;
  result: {
    data: any[];
    count: number;
  };
  raw_count: number;
}

export default function DirectAPITestPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from API...');
        const response = await fetch('/api/test-user-profiles');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        setData(result);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Direct API Test (No React Query)</h1>
      
      {loading && (
        <Alert variant="info">Loading data from API...</Alert>
      )}
      
      {error && (
        <Alert variant="danger">Error: {error}</Alert>
      )}
      
      {data && (
        <div>
          <Alert variant="success">
            <strong>Success!</strong> Fetched {data.result?.count || 0} users from API
          </Alert>
          
          <div style={{ background: '#f8f9fa', padding: '15px', margin: '10px 0' }}>
            <h3>API Response Summary:</h3>
            <ul>
              <li><strong>Success:</strong> {data.success ? 'Yes' : 'No'}</li>
              <li><strong>Total Count:</strong> {data.result?.count || 0}</li>
              <li><strong>Data Array Length:</strong> {data.result?.data?.length || 0}</li>
              <li><strong>Raw Count:</strong> {data.raw_count}</li>
            </ul>
          </div>

          {data.result?.data?.length > 0 && (
            <div style={{ background: '#e8f5e8', padding: '15px', margin: '10px 0' }}>
              <h4>First 3 Users:</h4>
              {data.result.data.slice(0, 3).map((user: any, index: number) => (
                <div key={user.id} style={{ marginBottom: '10px', padding: '10px', background: 'white', borderRadius: '5px' }}>
                  <strong>User {index + 1}:</strong> {user.first_name} {user.last_name} ({user.email}) - {user.role} - {user.status}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
