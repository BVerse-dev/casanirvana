"use client";

import { useDirectoryView } from "@/hooks/useDirectoryView";
import VisitorsGridPage from "./grid-view/page";
import VisitorsListPage from "./list-view/page";

const VisitorsDirectoryPage = () => {
  const { view } = useDirectoryView("visitors");

  return view === "list" ? <VisitorsListPage /> : <VisitorsGridPage />;
};

export default VisitorsDirectoryPage;
