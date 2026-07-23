import type { Metadata } from "next";
import UnitDetails from "../components/UnitDetails";

export const metadata: Metadata = { title: "Unit Details | Casa Nirvana Admin" };

const UnitDetailsPage = ({ params }: { params: { id: string } }) => <UnitDetails unitId={params.id} />;

export default UnitDetailsPage;
