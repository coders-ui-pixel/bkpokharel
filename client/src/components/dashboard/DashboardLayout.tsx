import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import { AnnouncementDisplay } from "./AnnouncementDisplay";
import { SelectedCourseProvider } from "../../context/SelectedCourseContext";

export function DashboardLayout() {
  return (
    <SelectedCourseProvider>
      <div className="dash-shell">
        <DashboardSidebar />
        <div className="dash-main">
          <DashboardTopbar />
          <AnnouncementDisplay />
          <div className="dash-content">
            <Outlet />
          </div>
        </div>
      </div>
    </SelectedCourseProvider>
  );
}
