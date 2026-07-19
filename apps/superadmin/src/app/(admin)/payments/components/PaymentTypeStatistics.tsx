"use client";
import React from "react";
import { Card, CardBody, Col } from "react-bootstrap";

const PaymentTypeStatistics = () => {
  const paymentTypes = [
    {
      type: "Electricity Bill",
      amount: 6050,
      color: "warning",
      icon: "ri:flashlight-line",
      percentage: 35.8,
    },
    {
      type: "Water Bill",
      amount: 3800,
      color: "info",
      icon: "ri:drop-line",
      percentage: 22.5,
    },
    {
      type: "Maintenance Fee",
      amount: 3300,
      color: "success",
      icon: "ri:tools-line",
      percentage: 19.6,
    },
    {
      type: "HOA Dues",
      amount: 2550,
      color: "primary",
      icon: "ri:home-4-line",
      percentage: 15.1,
    },
    {
      type: "Community Management",
      amount: 1130,
      color: "secondary",
      icon: "ri:community-line",
      percentage: 6.7,
    },
  ];

  const totalAmount = paymentTypes.reduce((sum, type) => sum + type.amount, 0);

  return (
    <Col xl={6} lg={6}>
      <Card 
        className="border-0 overflow-hidden position-relative"
        style={{
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        }}
      >
        <CardBody className="p-3">
          {/* Background decorative element */}
          <div className="position-absolute top-0 end-0 mt-n2 me-n2">
            <i className="ri:bar-chart-box-line text-white opacity-25" style={{ fontSize: '80px' }}></i>
          </div>
          
          <div className="position-relative">
            <div className="d-flex align-items-center mb-3">
              <div className="flex-grow-1">
                <h5 className="card-title mb-1 text-white fw-bold">Payment Categories</h5>
                <p className="text-white-75 mb-0 fs-14">Revenue by payment type</p>
              </div>
              <div className="flex-shrink-0 text-end">
                <div className="avatar-md bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center mb-2">
                  <i className="ri:money-dollar-circle-line text-white fs-20"></i>
                </div>
                <h4 className="text-white mb-0 fw-bold">${totalAmount.toLocaleString()}</h4>
                <p className="text-white-75 mb-0 fs-13">Total Revenue</p>
              </div>
            </div>
            
            <div className="mx-n2">
              {paymentTypes.map((type, index) => (
                <div 
                  key={index} 
                  className="d-flex align-items-center px-2 py-2 rounded-3 mb-2" 
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="flex-shrink-0 me-2">
                    <div className="avatar-xs bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center">
                      <i className={`${type.icon} text-white fs-14`}></i>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fs-13 text-white fw-medium">{type.type}</h6>
                    <div className="bg-white bg-opacity-25 rounded" style={{ height: "6px" }}>
                      <div
                        className="bg-white bg-opacity-90 rounded h-100"
                        role="progressbar"
                        style={{ 
                          width: `${type.percentage}%`,
                          transition: 'width 0.3s ease'
                        }}
                        aria-valuenow={type.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ms-2 text-end">
                    <h6 className="mb-1 fs-13 text-white fw-semibold">${type.amount.toLocaleString()}</h6>
                    <p className="text-white-75 mb-0 fs-11">{type.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 pt-2 border-top border-white border-opacity-25">
              <div className="row text-center">
                <div className="col-4">
                  <div className="text-white-75 fs-11 mb-1">Categories</div>
                  <div className="text-white fw-semibold fs-14">{paymentTypes.length}</div>
                </div>
                <div className="col-4">
                  <div className="text-white-75 fs-11 mb-1">Avg Amount</div>
                  <div className="text-white fw-semibold fs-14">${Math.round(totalAmount / paymentTypes.length).toLocaleString()}</div>
                </div>
                <div className="col-4">
                  <div className="text-white-75 fs-11 mb-1">Growth</div>
                  <div className="text-white fw-semibold fs-14">+12.5%</div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default PaymentTypeStatistics;
