import React from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import ActiveDriversList from "@/components/dashboard/ActiveDriversList";
import { Car, Users, DollarSign, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatsCard
                title="Total Rides"
                value="1,234"
                icon={Car}
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="Active Drivers"
                value="48"
                icon={Users}
                trend={{ value: 8, isPositive: true }}
              />
              <StatsCard
                title="Revenue"
                value="$12,345"
                icon={DollarSign}
                trend={{ value: 5, isPositive: true }}
              />
              <StatsCard
                title="Avg. Wait Time"
                value="4.5 min"
                icon={Clock}
                trend={{ value: 2, isPositive: false }}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActiveDriversList />
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <p className="text-gray-500">Coming soon...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;