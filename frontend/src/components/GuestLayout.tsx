import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

export default function GuestLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
