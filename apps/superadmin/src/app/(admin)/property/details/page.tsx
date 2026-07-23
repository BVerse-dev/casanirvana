import { permanentRedirect } from "next/navigation";

const LegacyUnitDetails = ({ searchParams = {} }: { searchParams?: { id?: string } }) => {
  permanentRedirect(searchParams.id ? `/units/${searchParams.id}` : "/units");
};

export default LegacyUnitDetails;
