'use client'
import properties1 from '@/assets/images/properties/p-1.jpg'
import properties2 from '@/assets/images/properties/p-2.jpg'
import properties3 from '@/assets/images/properties/p-3.jpg'
import properties4 from '@/assets/images/properties/p-4.jpg'
import properties5 from '@/assets/images/properties/p-5.jpg'
import trophyImg from '@/assets/images/trophy.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import ReactApexChart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Button, CardFooter, Badge, Carousel, CarouselItem } from 'react-bootstrap'
import AmenityDetailsCard from './AmenityDetailsCard'
import { useGetAmenity } from '@/hooks/useAmenities'

// Amenity Usage Chart Data
const amenityUsageChart: ApexOptions = {
  chart: {
    type: "area" as const,
    height: 150,
    sparkline: {
      enabled: true,
    },
  },
  series: [
    {
      data: [8, 15, 12, 25, 18, 22, 30, 28, 24, 32, 35],
    },
  ],
  stroke: {
    width: 2,
    curve: "smooth" as const,
  },
  fill: {
    type: "gradient" as const,
    gradient: {
      shade: "light" as const,
      type: "vertical" as const,
      opacityFrom: 0.4,
      opacityTo: 0,
      stops: [0, 100],
    },
  },
  markers: {
    size: 0,
  },
  colors: ["#007bff"],
  tooltip: {
    fixed: {
      enabled: false,
    },
    x: {
      show: false,
    },
    y: {
      title: {
        formatter: function (_seriesName: any) {
          return "";
        },
      },
    },
    marker: {
      show: false,
    },
  },
}

type AmenityDetailsProps = {
  amenityId: string
}

const AmenityDetails = ({ amenityId }: AmenityDetailsProps) => {
  const { data: amenity, isLoading } = useGetAmenity(amenityId)

  // Function to get the appropriate icon for each amenity type
  const getAmenityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "recreation":
        return "ri:game-line";
      case "fitness":
        return "ri:run-line";
      case "sports":
        return "ri:football-line";
      case "event space":
        return "ri:calendar-event-line";
      case "educational":
        return "ri:book-open-line";
      case "utility":
        return "ri:tools-line";
      default:
        return "ri:building-line";
    }
  };

  // Function to get amenity-specific carousel captions
  const getCarouselCaptions = (amenityType: string, amenityName: string) => {
    const type = amenityType?.toLowerCase();
    
    if (type === "fitness") {
      return [
        { icon: "ri:run-line", title: "Cardio Equipment", description: "Modern treadmills and exercise bikes" },
        { icon: "ri:dumbbell-line", title: "Weight Training", description: "Professional weightlifting equipment" },
        { icon: "ri:user-line", title: "Personal Training", description: "Expert fitness guidance available" },
        { icon: "ri:shirt-line", title: "Changing Rooms", description: "Clean facilities with lockers" },
        { icon: "ri:water-percent-line", title: "Hydration Station", description: "Water dispensers and towel service" }
      ];
    } else if (type === "sports") {
      return [
        { icon: "ri:football-line", title: "Playing Field", description: "Professional standard court/field" },
        { icon: "ri:flashlight-line", title: "Lighting System", description: "Flood lights for evening play" },
        { icon: "ri:tools-line", title: "Equipment Storage", description: "Sports equipment rental available" },
        { icon: "ri:group-line", title: "Spectator Area", description: "Seating for family and friends" },
        { icon: "ri:medal-line", title: "Competition Ready", description: "Tournament standard facilities" }
      ];
    } else if (type === "event space") {
      return [
        { icon: "ri:presentation-line", title: "Main Hall", description: "Spacious venue with modern amenities" },
        { icon: "ri:mic-line", title: "Audio System", description: "Professional sound equipment" },
        { icon: "ri:projector-line", title: "Visual Setup", description: "Projector and presentation tools" },
        { icon: "ri:restaurant-line", title: "Catering Area", description: "Food service and dining setup" },
        { icon: "ri:car-line", title: "Parking Space", description: "Dedicated parking for events" }
      ];
    } else if (type === "educational") {
      return [
        { icon: "ri:book-open-line", title: "Reading Area", description: "Quiet study space with books" },
        { icon: "ri:computer-line", title: "Digital Resources", description: "Internet access and computers" },
        { icon: "ri:group-line", title: "Study Groups", description: "Collaborative learning spaces" },
        { icon: "ri:lightbulb-line", title: "Research Corner", description: "Reference materials and journals" },
        { icon: "ri:coffee-line", title: "Break Area", description: "Refreshment zone for readers" }
      ];
    } else if (type === "utility") {
      return [
        { icon: "ri:car-line", title: "Parking Spaces", description: "Secure covered parking" },
        { icon: "ri:shield-check-line", title: "Security System", description: "24/7 surveillance monitoring" },
        { icon: "ri:id-card-line", title: "Access Control", description: "Digital entry management" },
        { icon: "ri:tools-line", title: "Maintenance Area", description: "Service and repair facilities" },
        { icon: "ri:customer-service-line", title: "Help Desk", description: "Attendant service available" }
      ];
    } else {
      // Default for Recreation or unknown
      return [
        { icon: "ri:swim-line", title: `${amenityName} Main Area`, description: "Primary facility with modern amenities" },
        { icon: "ri:restaurant-line", title: "Relaxation Zone", description: "Seating area with refreshments" },
        { icon: "ri:shirt-line", title: "Changing Rooms", description: "Modern facilities with lockers" },
        { icon: "ri:drop-line", title: "Shower Facilities", description: "Clean and well-maintained" },
        { icon: "ri:water-percent-line", title: "Additional Features", description: "Enhanced facility amenities" }
      ];
    }
  };

  if (isLoading) {
    return (
      <Row className="justify-content-center">
        <Col xl={12}>
          <Card>
            <div className="text-center p-4">Loading amenity details...</div>
          </Card>
        </Col>
      </Row>
    )
  }

  if (!amenity) {
    return (
      <Row className="justify-content-center">
        <Col xl={12}>
          <Card>
            <div className="text-center p-4 text-danger">Amenity not found</div>
          </Card>
        </Col>
      </Row>
    )
  }

  const carouselCaptions = getCarouselCaptions(amenity.amenity_type, amenity.name);

  return (
    <Row className="justify-content-center">
      <Col xl={8} lg={12}>
        <AmenityDetailsCard amenity={amenity} />
      </Col>
      <Col xl={4} lg={12}>
        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Usage Excellence Award</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-center">
              <Image src={trophyImg} alt="trophy" width={120} height={120} />
              <h4 className="mt-3">
                Most Popular Amenity!
              </h4>
              <p className="text-muted">
                {amenity.name} has been the most sought-after amenity with excellent user satisfaction, 
                consistent bookings, and outstanding facility maintenance.
              </p>

              <div className="d-flex justify-content-around mt-4">
                <div className="text-center">
                  <h5 className="fw-semibold text-success mb-2">95%</h5>
                  <p className="text-muted mb-0">Satisfaction</p>
                </div>
                <div className="text-center">
                  <h5 className="fw-semibold text-primary mb-2">4.8</h5>
                  <p className="text-muted mb-0">Rating</p>
                </div>
                <div className="text-center">
                  <h5 className="fw-semibold text-warning mb-2">78%</h5>
                  <p className="text-muted mb-0">Utilization</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h4">Property Photos</CardTitle>
          </CardHeader>
          <CardBody>
            <Carousel indicators={false}>
              <CarouselItem className="carousel-item active">
                <Image src={properties1} width={400} height={305} className="d-block w-100 rounded" alt="amenity-photo-1" />
                <div className="carousel-caption d-none d-md-block bg-light rounded p-2 text-start">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar bg-primary rounded flex-centered">
                      <IconifyIcon icon={carouselCaptions[0].icon} width={24} height={24} className="fs-24 text-white" />
                    </div>
                    <div>
                      <Link href="" className="text-dark fw-medium fs-16">
                        {carouselCaptions[0].title}
                      </Link>
                      <p className="text-muted mb-0">{carouselCaptions[0].description}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem className="carousel-item">
                <Image src={properties2} width={400} height={305} className="d-block w-100 rounded" alt="amenity-photo-2" />
                <div className="carousel-caption d-none d-md-block bg-light rounded p-2 text-start">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar bg-primary rounded flex-centered">
                      <IconifyIcon icon={carouselCaptions[1].icon} width={24} height={24} className="fs-24 text-white" />
                    </div>
                    <div>
                      <Link href="" className="text-dark fw-medium fs-16">
                        {carouselCaptions[1].title}
                      </Link>
                      <p className="text-muted mb-0">{carouselCaptions[1].description}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem className="carousel-item">
                <Image src={properties3} width={400} height={305} className="d-block w-100 rounded" alt="amenity-photo-3" />
                <div className="carousel-caption d-none d-md-block bg-light rounded p-2 text-start">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar bg-primary rounded flex-centered">
                      <IconifyIcon icon={carouselCaptions[2].icon} width={24} height={24} className="fs-24 text-white" />
                    </div>
                    <div>
                      <Link href="" className="text-dark fw-medium fs-16">
                        {carouselCaptions[2].title}
                      </Link>
                      <p className="text-muted mb-0">{carouselCaptions[2].description}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem className="carousel-item">
                <Image src={properties4} width={400} height={305} className="d-block w-100 rounded" alt="amenity-photo-4" />
                <div className="carousel-caption d-none d-md-block bg-light rounded p-2 text-start">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar bg-primary rounded flex-centered">
                      <IconifyIcon icon={carouselCaptions[3].icon} width={24} height={24} className="fs-24 text-white" />
                    </div>
                    <div>
                      <Link href="" className="text-dark fw-medium fs-16">
                        {carouselCaptions[3].title}
                      </Link>
                      <p className="text-muted mb-0">{carouselCaptions[3].description}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem className="carousel-item">
                <Image src={properties5} width={400} height={305} className="d-block w-100 rounded" alt="amenity-photo-5" />
                <div className="carousel-caption d-none d-md-block bg-light rounded p-2 text-start">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar bg-primary rounded flex-centered">
                      <IconifyIcon icon={carouselCaptions[4].icon} width={24} height={24} className="fs-24 text-white" />
                    </div>
                    <div>
                      <Link href="" className="text-dark fw-medium fs-16">
                        {carouselCaptions[4].title}
                      </Link>
                      <p className="text-muted mb-0">{carouselCaptions[4].description}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </Carousel>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Recent Booking Activities</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="avatar-sm bg-success-subtle rounded-circle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:calendar-check-line" className="text-success" />
              </div>
              <div className="flex-1">
                <h6 className="mb-1">Booking Confirmed</h6>
                <p className="text-muted mb-1 fs-13">Rajesh Kumar booked for 2 hours - Family swimming session</p>
                <small className="text-muted">1 hour ago</small>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="avatar-sm bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:time-line" className="text-primary" />
              </div>
              <div className="flex-1">
                <h6 className="mb-1">Session Completed</h6>
                <p className="text-muted mb-1 fs-13">Morning aqua aerobics session completed with 8 participants</p>
                <small className="text-muted">3 hours ago</small>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="avatar-sm bg-warning-subtle rounded-circle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:tools-line" className="text-warning" />
              </div>
              <div className="flex-1">
                <h6 className="mb-1">Maintenance Update</h6>
                <p className="text-muted mb-1 fs-13">Weekly pool cleaning and chemical balance check completed</p>
                <small className="text-muted">Yesterday</small>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3">
              <div className="avatar-sm bg-info-subtle rounded-circle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:star-line" className="text-info" />
              </div>
              <div className="flex-1">
                <h6 className="mb-1">5-Star Review</h6>
                <p className="text-muted mb-1 fs-13">Excellent facility with clean water and friendly staff</p>
                <small className="text-muted">2 days ago</small>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Monthly Usage Statistics</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-center mb-3">
              <ReactApexChart 
                options={amenityUsageChart} 
                series={amenityUsageChart.series} 
                height={150} 
                type="area" 
                className="apex-charts" 
              />
            </div>
            <div className="row text-center">
              <div className="col-6">
                <div className="mb-3">
                  <h4 className="text-primary">142</h4>
                  <p className="text-muted mb-0">Total Bookings</p>
                </div>
              </div>
              <div className="col-6">
                <div className="mb-3">
                  <h4 className="text-success">248</h4>
                  <p className="text-muted mb-0">Hours Booked</p>
                </div>
              </div>
              <div className="col-6">
                <div className="mb-3">
                  <h4 className="text-warning">$37,200</h4>
                  <p className="text-muted mb-0">Revenue</p>
                </div>
              </div>
              <div className="col-6">
                <div className="mb-0">
                  <h4 className="text-info">89</h4>
                  <p className="text-muted mb-0">Unique Users</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default AmenityDetails
