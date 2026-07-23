import { permanentRedirect } from "next/navigation";

const LegacyCommunityDetails = ({ searchParams = {} }: { searchParams?: { id?: string } }) => {
  permanentRedirect(searchParams.id ? `/communities/${searchParams.id}` : "/communities");
};

export default LegacyCommunityDetails;
