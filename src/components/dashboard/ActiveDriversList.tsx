import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const drivers = [
  { id: 1, name: "Michael Brown", status: "active", rides: 12, earnings: 240 },
  { id: 2, name: "Sarah Wilson", status: "active", rides: 8, earnings: 160 },
  { id: 3, name: "James Davis", status: "inactive", rides: 5, earnings: 100 },
  { id: 4, name: "Emma Taylor", status: "active", rides: 10, earnings: 200 },
];

const ActiveDriversList = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Active Drivers</h2>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                  {driver.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{driver.name}</p>
                  <div className="flex items-center space-x-1">
                    {driver.status === "active" ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-danger" />
                    )}
                    <span className="text-sm text-gray-500 capitalize">
                      {driver.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium">{driver.rides} rides</p>
                <p className="text-sm text-gray-500">${driver.earnings} today</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveDriversList;