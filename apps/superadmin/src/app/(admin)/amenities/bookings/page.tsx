import PageTitle from "@/components/PageTitle";
import BookingsList from "./components/BookingsList";
import BookingsStat from "./components/BookingsStat";
import BookingsOverview from "./components/BookingsOverview";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Amenity Bookings" };

const AmenityBookingsPage = () => {
  return (
    <>
      <PageTitle title="Amenity Bookings" subName="Operations" />
      <BookingsStat />
      <BookingsOverview />
      <BookingsList />
    </>
  );
};

export default AmenityBookingsPage;
