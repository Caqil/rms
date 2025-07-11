"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, AlertCircle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { MenuItem } from "@/stores/menuStore";
import Image from "next/image";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  // Calculate profit margin
  const profitMargin =
    item.price > 0 ? ((item.price - item.cost) / item.price) * 100 : 0;

  return (
    <Card
      className={`h-full ${
        !item.availability ? "opacity-50" : "hover:shadow-lg"
      } transition-all duration-200 cursor-pointer group`}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden rounded-t-lg">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-gray-400 text-4xl">🍽️</span>
            </div>
          )}

          {/* Availability Badge */}
          {!item.availability && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive">Unavailable</Badge>
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-white/90 text-gray-900 hover:bg-white">
              {formatCurrency(item.price)}
            </Badge>
          </div>

          {/* Cost Badge (for internal use) */}
          {process.env.NODE_ENV === "development" && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="outline" className="bg-white/90 text-xs">
                Cost: {formatCurrency(item.cost)}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {item.description}
              </p>
            </div>

            {/* Meta Information */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{item.preparationTime} min</span>
              </div>

              {item.allergens.length > 0 && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3 text-orange-500" />
                  <span className="text-orange-600">Allergens</span>
                </div>
              )}

              {/* Profit Margin (for managers) */}
              {profitMargin > 0 && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">
                    {profitMargin.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            {/* Allergens List */}
            {item.allergens.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.allergens.slice(0, 3).map((allergen) => (
                  <Badge key={allergen} variant="outline" className="text-xs">
                    {allergen}
                  </Badge>
                ))}
                {item.allergens.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.allergens.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Nutritional Info Preview */}
            {item.nutritionalInfo && (
              <div className="text-xs text-gray-500">
                <span>{item.nutritionalInfo.calories} cal</span>
                {item.nutritionalInfo.protein > 0 && (
                  <span className="ml-2">
                    {item.nutritionalInfo.protein}g protein
                  </span>
                )}
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              onClick={() => onAddToCart(item)}
              disabled={!item.availability}
              className="w-full group-hover:bg-indigo-600 transition-colors"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
