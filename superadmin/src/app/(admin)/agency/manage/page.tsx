import AgencyOperationsWorkspace, {
  type AgencySectionKey,
} from "@/components/operations/AgencyOperationsWorkspace";

const VALID_SECTIONS = new Set<AgencySectionKey>([
  "profiles",
  "staff",
  "services",
  "finance",
  "documents",
]);

type ManageAgencyPageProps = {
  searchParams?: {
    tab?: string;
  };
};

const resolveSection = (tab?: string): AgencySectionKey =>
  tab && VALID_SECTIONS.has(tab as AgencySectionKey)
    ? (tab as AgencySectionKey)
    : "profiles";

const Page = ({ searchParams }: ManageAgencyPageProps) => (
  <AgencyOperationsWorkspace section={resolveSection(searchParams?.tab)} />
);

export default Page;
