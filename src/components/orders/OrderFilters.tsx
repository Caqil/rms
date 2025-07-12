// src/components/orders/OrderFilters.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  Filter,
  X,
  RotateCcw,
  Search,
  DollarSign,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { format } from "date-fns";

interface OrderFiltersProps {
  filters: {
    status: string[];
    orderType: string[];
    dateRange: {
      from: Date | null;
      to: Date | null;
    };
    amountRange: {
      min: number | null;
      max: number | null;
    };
    tableNumber: string;
    customerName: string;
    preparationTime: string;
  };
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
}

export default function OrderFilters({
  filters,
  onUpdateFilter,
  onClearFilters,
}: OrderFiltersProps) {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.dateRange.from || undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.dateRange.to || undefined
  );

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-500" },
    { value: "confirmed", label: "Confirmed", color: "bg-blue-500" },
    { value: "preparing", label: "Preparing", color: "bg-orange-500" },
    { value: "ready", label: "Ready", color: "bg-purple-500" },
    { value: "served", label: "Served", color: "bg-green-500" },
    { value: "completed", label: "Completed", color: "bg-gray-500" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
  ];

  const orderTypeOptions = [
    { value: "dine_in", label: "Dine In" },
    { value: "takeout", label: "Takeout" },
    { value: "delivery", label: "Delivery" },
  ];

  const preparationTimeOptions = [
    { value: "fast", label: "Fast (< 15 min)" },
    { value: "normal", label: "Normal (15-30 min)" },
    { value: "slow", label: "Slow (> 30 min)" },
  ];

  const handleStatusToggle = (status: string) => {
    const currentStatuses = filters.status || [];
    const updated = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    onUpdateFilter("status", updated);
  };

  const handleOrderTypeToggle = (type: string) => {
    const currentTypes = filters.orderType || [];
    const updated = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    onUpdateFilter("orderType", updated);
  };

  const handleDateRangeUpdate = () => {
    onUpdateFilter("dateRange", {
      from: dateFrom || null,
      to: dateTo || null,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.status.length > 0 ||
      filters.orderType.length > 0 ||
      filters.dateRange.from ||
      filters.dateRange.to ||
      filters.amountRange.min ||
      filters.amountRange.max ||
      filters.tableNumber ||
      filters.customerName ||
      filters.preparationTime
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.orderType.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.amountRange.min || filters.amountRange.max) count++;
    if (filters.tableNumber) count++;
    if (filters.customerName) count++;
    if (filters.preparationTime) count++;
    return count;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Filter orders by status, type, date, and more
            </CardDescription>
          </div>
          {hasActiveFilters() && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Order Status</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <div
                key={option.value}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-all
                  ${
                    filters.status.includes(option.value)
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }
                `}
                onClick={() => handleStatusToggle(option.value)}
              >
                <div className={`w-3 h-3 rounded-full ${option.color}`} />
                <span className="text-sm font-medium">{option.label}</span>
                {filters.status.includes(option.value) && (
                  <X className="h-3 w-3" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Type Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Order Type</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {orderTypeOptions.map((option) => (
              <div
                key={option.value}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-all
                  ${
                    filters.orderType.includes(option.value)
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }
                `}
                onClick={() => handleOrderTypeToggle(option.value)}
              >
                <span className="text-sm font-medium">{option.label}</span>
                {filters.orderType.includes(option.value) && (
                  <X className="h-3 w-3" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>From Date</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(date) => {
                    setDateFrom(date);
                    setTimeout(handleDateRangeUpdate, 100);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>To Date</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(date) => {
                    setDateTo(date);
                    setTimeout(handleDateRangeUpdate, 100);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Amount Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Min Amount</span>
            </Label>
            <Input
              type="number"
              placeholder="0.00"
              value={filters.amountRange.min || ""}
              onChange={(e) =>
                onUpdateFilter("amountRange", {
                  ...filters.amountRange,
                  min: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Max Amount</span>
            </Label>
            <Input
              type="number"
              placeholder="1000.00"
              value={filters.amountRange.max || ""}
              onChange={(e) =>
                onUpdateFilter("amountRange", {
                  ...filters.amountRange,
                  max: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Table Number</span>
            </Label>
            <Input
              placeholder="Table 1, 2, 3..."
              value={filters.tableNumber}
              onChange={(e) => onUpdateFilter("tableNumber", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Customer Name</span>
            </Label>
            <Input
              placeholder="Search customer..."
              value={filters.customerName}
              onChange={(e) => onUpdateFilter("customerName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Preparation Time</span>
            </Label>
            <Select
              value={filters.preparationTime}
              onValueChange={(value) =>
                onUpdateFilter("preparationTime", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any duration</SelectItem>
                {preparationTimeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Active Filters:</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs h-6"
              >
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.status.map((status) => (
                <Badge key={status} variant="secondary" className="text-xs">
                  Status: {status}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => handleStatusToggle(status)}
                  />
                </Badge>
              ))}
              {filters.orderType.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  Type: {type.replace("_", " ")}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => handleOrderTypeToggle(type)}
                  />
                </Badge>
              ))}
              {filters.dateRange.from && (
                <Badge variant="secondary" className="text-xs">
                  From: {format(filters.dateRange.from, "MMM dd")}
                </Badge>
              )}
              {filters.dateRange.to && (
                <Badge variant="secondary" className="text-xs">
                  To: {format(filters.dateRange.to, "MMM dd")}
                </Badge>
              )}
              {(filters.amountRange.min || filters.amountRange.max) && (
                <Badge variant="secondary" className="text-xs">
                  Amount: ${filters.amountRange.min || 0} - $
                  {filters.amountRange.max || "∞"}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
