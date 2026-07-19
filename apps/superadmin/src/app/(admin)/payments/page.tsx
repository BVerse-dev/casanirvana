import PageTitle from "@/components/PageTitle";
import { Metadata } from "next";
import PaymentData from "./components/PaymentData";
import PaymentGridCard from "./components/PaymentGridCard";

export const metadata: Metadata = { title: "Payments" };

const PaymentsPage = () => {
  return (
    <>
      <PageTitle title="Payments" subName="Casa Nirvana" />
      <PaymentGridCard />
      <PaymentData />
    </>
  );
};

export default PaymentsPage;
