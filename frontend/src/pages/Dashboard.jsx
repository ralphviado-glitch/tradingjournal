import { useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import KPICards from "../components/KPICards";

export default function Dashboard() {
  const tradeTableRef = useRef();



  return (
    <div className="container-fluid">
      <div className="row">

        {/* Main Content */}
        <main className="col-10 main-content">
          <h2 className="mb-4">Dashboard</h2>

          <KPICards />


        </main>
      </div>
    </div>
  );
}
