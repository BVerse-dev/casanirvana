import GuardOperationsWorkspace, {
  type GuardSectionKey,
} from "@/components/operations/GuardOperationsWorkspace";

const VALID_SECTIONS = new Set<GuardSectionKey>([
  "profiles",
  "schedules",
  "assignments",
  "equipment",
  "performance",
  "training",
]);

type ManageGuardsPageProps = {
  searchParams?: {
    tab?: string;
  };
};

const resolveSection = (tab?: string): GuardSectionKey =>
  tab && VALID_SECTIONS.has(tab as GuardSectionKey)
    ? (tab as GuardSectionKey)
    : "profiles";

const Page = ({ searchParams }: ManageGuardsPageProps) => (
  <GuardOperationsWorkspace section={resolveSection(searchParams?.tab)} />
);

export default Page;
