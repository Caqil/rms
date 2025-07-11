"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users, MapPin, Clock } from "lucide-react";
import { useTables } from "@/hooks/useTables";
import { useOrders } from "@/hooks/useOrders";

interface TableSelectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTableSelect: (tableNumber: string) => void;
}

export default function TableSelection({
  open,
  onOpenChange,
  onTableSelect,
}: TableSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const { tables, updateStatus } = useTables();
  const { setTableNumber } = useOrders();

  // Get unique sections
  const sections = Array.from(
    new Set(tables.map((table) => table.section).filter(Boolean))
  );

  // Filter tables based on search and section
  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.number
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSection =
      !selectedSection || table.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const handleTableSelect = async (table: any) => {
    if (table.status !== "available") return;

    setTableNumber(table.number);
    await updateStatus(table._id, "occupied");
    onTableSelect(table.number);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "occupied":
        return "bg-red-500";
      case "reserved":
        return "bg-yellow-500";
      case "cleaning":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Available";
      case "occupied":
        return "Occupied";
      case "reserved":
        return "Reserved";
      case "cleaning":
        return "Cleaning";
      default:
        return "Unknown";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Select Table</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search table number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Section Filters */}
          {sections.length > 0 && (
            <div className="flex items-center space-x-2">
              <Label>Section:</Label>
              <div className="flex space-x-2">
                <Button
                  variant={selectedSection === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection(null)}
                >
                  All
                </Button>
                {sections.map((section) => (
                  <Button
                    key={section}
                    variant={
                      selectedSection === section ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedSection(section ?? null)}
                  >
                    {section}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Status Legend */}
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Status:</span>
            {["available", "occupied", "reserved", "cleaning"].map((status) => (
              <div key={status} className="flex items-center space-x-1">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}
                />
                <span className="text-sm capitalize">{status}</span>
              </div>
            ))}
          </div>

          {/* Tables Grid */}
          <ScrollArea className="h-96">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-1">
              {filteredTables.map((table) => (
                <Button
                  key={table._id}
                  variant="outline"
                  className={`h-24 flex flex-col items-center justify-center space-y-2 relative ${
                    table.status === "available"
                      ? "hover:bg-green-50 hover:border-green-500 cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={() => handleTableSelect(table)}
                  disabled={table.status !== "available"}
                >
                  <div
                    className={`absolute top-1 right-1 w-3 h-3 rounded-full ${getStatusColor(
                      table.status
                    )}`}
                  />

                  <div className="text-center">
                    <div className="font-bold text-lg">T{table.number}</div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>{table.capacity}</span>
                    </div>
                  </div>

                  {table.section && (
                    <Badge variant="secondary" className="text-xs">
                      {table.section}
                    </Badge>
                  )}

                  <div className="text-xs text-center">
                    <div
                      className={`${
                        table.status === "available"
                          ? "text-green-600"
                          : table.status === "occupied"
                          ? "text-red-600"
                          : table.status === "reserved"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    >
                      {getStatusText(table.status)}
                    </div>

                    {table.estimatedDuration && table.status === "occupied" && (
                      <div className="flex items-center justify-center space-x-1 text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{table.estimatedDuration}m</span>
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>

            {filteredTables.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No tables found matching your criteria
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
