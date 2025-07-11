"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Calendar, ShoppingCart, Mail } from "lucide-react";

interface ReorderAlertsProps {
  items: any[];
  expiringItems: any[];
}

export default function ReorderAlerts({
  items,
  expiringItems,
}: ReorderAlertsProps) {
  if (items.length === 0 && expiringItems.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Low Stock Alerts */}
      {items.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Low Stock Alerts</span>
              <Badge variant="destructive">{items.length}</Badge>
            </CardTitle>
            <CardDescription className="text-red-600">
              Items that need reordering
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-40 overflow-y-auto space-y-2">
              {items.slice(0, 5).map((item) => (
                <Alert key={item._id} className="border-red-200 bg-white">
                  <AlertDescription>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.itemName}</span>
                        <div className="text-xs text-gray-500">
                          Current: {item.quantity} {item.unit} • Reorder at:{" "}
                          {item.reorderLevel}
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {Math.round((item.quantity / item.reorderLevel) * 100)}%
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
              {items.length > 5 && (
                <p className="text-sm text-red-600 text-center">
                  +{items.length - 5} more items need attention
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create Order
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Email Suppliers
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiring Items */}
      {expiringItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Expiring Soon</span>
              <Badge
                variant="secondary"
                className="bg-orange-200 text-orange-800"
              >
                {expiringItems.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-orange-600">
              Items expiring within 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-40 overflow-y-auto space-y-2">
              {expiringItems.slice(0, 5).map((item) => {
                const daysUntilExpiry = Math.ceil(
                  (new Date(item.expirationDate).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                return (
                  <Alert key={item._id} className="border-orange-200 bg-white">
                    <AlertDescription>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.itemName}</span>
                          <div className="text-xs text-gray-500">
                            {item.quantity} {item.unit} • Expires:{" "}
                            {new Date(item.expirationDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge
                          variant={
                            daysUntilExpiry <= 2 ? "destructive" : "secondary"
                          }
                          className="text-xs"
                        >
                          {daysUntilExpiry <= 0
                            ? "Expired"
                            : daysUntilExpiry === 1
                            ? "1 day"
                            : `${daysUntilExpiry} days`}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                );
              })}
              {expiringItems.length > 5 && (
                <p className="text-sm text-orange-600 text-center">
                  +{expiringItems.length - 5} more items expiring soon
                </p>
              )}
            </div>
            <Button size="sm" variant="outline" className="w-full">
              Create Discount Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
