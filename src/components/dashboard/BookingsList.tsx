import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Booking = Tables<"bookings">;

const BookingsList = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          customer:profiles!bookings_customer_id_fkey(full_name),
          driver:profiles!bookings_driver_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error("Error in fetchBookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const assignDriver = async (bookingId: string, driverId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ 
          driver_id: driverId,
          status: "assigned" 
        })
        .eq("id", bookingId);

      if (error) {
        console.error("Error assigning driver:", error);
        toast.error("Failed to assign driver");
        return;
      }

      toast.success("Driver assigned successfully");
      fetchBookings();
    } catch (error) {
      console.error("Error in assignDriver:", error);
      toast.error("Failed to assign driver");
    }
  };

  useEffect(() => {
    fetchBookings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("bookings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          console.log("Booking update received:", payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div>Loading bookings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Dropoff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  {(booking.customer as any)?.full_name || "Unknown"}
                </TableCell>
                <TableCell>{booking.pickup_address}</TableCell>
                <TableCell>{booking.dropoff_address}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </TableCell>
                <TableCell>
                  {(booking.driver as any)?.full_name || "Unassigned"}
                </TableCell>
                <TableCell>
                  {booking.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // For demo purposes, assigning to a fixed driver ID
                        // In a real app, you'd show a driver selection dialog
                        assignDriver(booking.id, "some-driver-id");
                      }}
                    >
                      Assign Driver
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BookingsList;