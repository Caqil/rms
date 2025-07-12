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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Users,
  Building,
  Settings,
  Eye,
} from "lucide-react";
import {
  useRestaurants,
  useRestaurantOperations,
  Restaurant,
} from "@/hooks/useRestaurants";

export default function RestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch restaurants
  const {
    restaurants,
    pagination,
    loading: restaurantsLoading,
    refetch: refetchRestaurants,
  } = useRestaurants({
    search: searchTerm,
    status: filterStatus as "all" | "active" | "inactive",
  });

  // Restaurant operations
  const { createRestaurant, updateRestaurant, deleteRestaurant } =
    useRestaurantOperations();

  // Restaurants are already filtered by the hook
  const filteredRestaurants = restaurants;

  const handleCreateRestaurant = async (formData: FormData) => {
    try {
      const restaurantData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        capacity: parseInt(formData.get("capacity") as string),
        priceRange: formData.get("priceRange") as
          | "budget"
          | "mid"
          | "upscale"
          | "fine_dining",
        cuisine: (formData.get("cuisine") as string)
          .split(",")
          .map((c) => c.trim()),
        address: {
          street: formData.get("street") as string,
          city: formData.get("city") as string,
          state: formData.get("state") as string,
          zipCode: formData.get("zipCode") as string,
          country: formData.get("country") as string,
        },
        contactInfo: {
          phone: formData.get("phone") as string,
          email: formData.get("email") as string,
          website: formData.get("website") as string,
        },
        taxRate: parseFloat(formData.get("taxRate") as string) || 0,
        serviceChargeRate:
          parseFloat(formData.get("serviceChargeRate") as string) || 0,
        currency: (formData.get("currency") as string) || "USD",
        timezone: formData.get("timezone") as string,
      };
      await createRestaurant(restaurantData);
      setIsCreateDialogOpen(false);
      refetchRestaurants();
    } catch (error) {
      console.error("Failed to create restaurant:", error);
    }
  };

  const handleEditRestaurant = async (formData: FormData) => {
    if (!selectedRestaurant) return;
    try {
      const restaurantData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        capacity: parseInt(formData.get("capacity") as string),
        priceRange: formData.get("priceRange") as
          | "budget"
          | "mid"
          | "upscale"
          | "fine_dining",
        cuisine: (formData.get("cuisine") as string)
          .split(",")
          .map((c) => c.trim()),
        address: {
          street: formData.get("street") as string,
          city: formData.get("city") as string,
          state: formData.get("state") as string,
          zipCode: formData.get("zipCode") as string,
          country: formData.get("country") as string,
        },
        contactInfo: {
          phone: formData.get("phone") as string,
          email: formData.get("email") as string,
          website: formData.get("website") as string,
        },
        taxRate: parseFloat(formData.get("taxRate") as string) || 0,
        serviceChargeRate:
          parseFloat(formData.get("serviceChargeRate") as string) || 0,
        currency: (formData.get("currency") as string) || "USD",
        timezone: formData.get("timezone") as string,
      };
      await updateRestaurant(selectedRestaurant._id, restaurantData);
      setIsEditDialogOpen(false);
      refetchRestaurants();
    } catch (error) {
      console.error("Failed to update restaurant:", error);
    }
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    try {
      await deleteRestaurant(restaurantId);
      refetchRestaurants();
    } catch (error) {
      console.error("Failed to delete restaurant:", error);
    }
  };

  const getPriceRangeLabel = (priceRange: string) => {
    const labels = {
      budget: "Budget ($)",
      mid: "Mid-range ($$)",
      upscale: "Upscale ($$$)",
      fine_dining: "Fine Dining ($$$$)",
    };
    return labels[priceRange as keyof typeof labels] || priceRange;
  };

  if (restaurantsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurants</h1>
          <p className="text-muted-foreground">
            Manage restaurant locations and configurations
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Restaurant</DialogTitle>
              <DialogDescription>
                Create a new restaurant location with all necessary details.
              </DialogDescription>
            </DialogHeader>
            <RestaurantForm onSubmit={handleCreateRestaurant} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Restaurants
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurants.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Locations
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurants.filter((r) => r.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently operating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Capacity
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurants.reduce((sum, r) => sum + r.capacity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Combined seating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                restaurants.reduce((sum, r) => sum + r.averageRating, 0) /
                  restaurants.length || 0
              ).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Restaurants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Locations</CardTitle>
          <CardDescription>
            Manage all restaurant locations and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search restaurants by name, city, or cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Restaurants</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{restaurant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {restaurant.cuisine?.join(", ") || "N/A"} •{" "}
                          {getPriceRangeLabel(restaurant.priceRange)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-1 h-3 w-3" />
                          {restaurant.address?.city || "N/A"},{" "}
                          {restaurant.address?.state || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {restaurant.address?.street || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          {restaurant.contactInfo?.phone || "N/A"}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {restaurant.contactInfo?.email || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {restaurant.capacity || 0} seats
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="mr-1 h-3 w-3 fill-current text-yellow-400" />
                        <span className="text-sm">
                          {restaurant.averageRating?.toFixed(1) || "0.0"} (
                          {restaurant.totalReviews || 0})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={restaurant.isActive ? "default" : "secondary"}
                      >
                        {restaurant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRestaurant(restaurant);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRestaurant(restaurant);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRestaurant(restaurant._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Restaurant Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Restaurant Details</DialogTitle>
            <DialogDescription>
              Complete restaurant information and configuration
            </DialogDescription>
          </DialogHeader>
          {selectedRestaurant && (
            <RestaurantDetails restaurant={selectedRestaurant} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Restaurant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Restaurant</DialogTitle>
            <DialogDescription>
              Update restaurant information and settings
            </DialogDescription>
          </DialogHeader>
          {selectedRestaurant && (
            <RestaurantForm
              restaurant={selectedRestaurant}
              onSubmit={handleEditRestaurant}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Restaurant Form Component
function RestaurantForm({
  restaurant,
  onSubmit,
}: {
  restaurant?: Restaurant;
  onSubmit: (formData: FormData) => void;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={restaurant?.name}
                required
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                defaultValue={restaurant?.capacity}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={restaurant?.description}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceRange">Price Range</Label>
              <Select name="priceRange" defaultValue={restaurant?.priceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget ($)</SelectItem>
                  <SelectItem value="mid">Mid-range ($$)</SelectItem>
                  <SelectItem value="upscale">Upscale ($$$)</SelectItem>
                  <SelectItem value="fine_dining">
                    Fine Dining ($$$$)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cuisine">Cuisine Types</Label>
              <Input
                id="cuisine"
                name="cuisine"
                placeholder="Italian, Mediterranean, etc."
                defaultValue={restaurant?.cuisine?.join(", ") || ""}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              name="street"
              defaultValue={restaurant?.address?.street || ""}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                defaultValue={restaurant?.address?.city || ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                defaultValue={restaurant?.address?.state || ""}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                name="zipCode"
                defaultValue={restaurant?.address?.zipCode || ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                name="country"
                defaultValue={restaurant?.address?.country || ""}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={restaurant?.contactInfo?.phone || ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={restaurant?.contactInfo?.email || ""}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              defaultValue={restaurant?.contactInfo?.website || ""}
            />
          </div>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Set operating hours for each day of the week
          </div>
          {[
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ].map((day) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-24 font-medium capitalize">{day}</div>
              <div className="flex items-center space-x-2">
                <Input
                  type="time"
                  name={`${day}_open`}
                  defaultValue={
                    restaurant?.businessHours?.[
                      day as keyof typeof restaurant.businessHours
                    ]?.open || ""
                  }
                  className="w-32"
                />
                <span>to</span>
                <Input
                  type="time"
                  name={`${day}_close`}
                  defaultValue={
                    restaurant?.businessHours?.[
                      day as keyof typeof restaurant.businessHours
                    ]?.close || ""
                  }
                  className="w-32"
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name={`${day}_closed`}
                    defaultChecked={
                      restaurant?.businessHours[
                        day as keyof typeof restaurant.businessHours
                      ]?.isClosed
                    }
                  />
                  <span className="text-sm">Closed</span>
                </label>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                name="taxRate"
                type="number"
                step="0.01"
                defaultValue={restaurant?.taxRate}
              />
            </div>
            <div>
              <Label htmlFor="serviceChargeRate">Service Charge (%)</Label>
              <Input
                id="serviceChargeRate"
                name="serviceChargeRate"
                type="number"
                step="0.01"
                defaultValue={restaurant?.serviceChargeRate}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                name="currency"
                defaultValue={restaurant?.currency || "USD"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select name="timezone" defaultValue={restaurant?.timezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    Pacific Time
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button type="submit">
          {restaurant ? "Update Restaurant" : "Create Restaurant"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Restaurant Details Component
function RestaurantDetails({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="hours">Hours</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Location</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                {restaurant.address.street}
              </div>
              <div className="ml-6">
                {restaurant.address.city}, {restaurant.address.state}{" "}
                {restaurant.address.zipCode}
              </div>
              <div className="ml-6">{restaurant.address.country}</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                {restaurant.contactInfo.phone}
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                {restaurant.contactInfo.email}
              </div>
              {restaurant.contactInfo.website && (
                <div className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  {restaurant.contactInfo.website}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">
            {restaurant.description || "No description available"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium mb-2">Capacity</h4>
            <p className="text-sm">{restaurant.capacity} seats</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Price Range</h4>
            <p className="text-sm">{restaurant.priceRange}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Cuisine</h4>
            <p className="text-sm">{restaurant.cuisine.join(", ")}</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="hours" className="space-y-4">
        <h4 className="font-medium">Business Hours</h4>
        <div className="space-y-2">
          {Object.entries(restaurant.businessHours).map(([day, hours]) => (
            <div key={day} className="flex justify-between items-center">
              <span className="capitalize font-medium">{day}</span>
              {hours.isClosed ? (
                <span className="text-red-500">Closed</span>
              ) : (
                <span>
                  {hours.open} - {hours.close}
                </span>
              )}
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Financial Settings</h4>
            <div className="space-y-2 text-sm">
              <div>Tax Rate: {restaurant.taxRate}%</div>
              <div>Service Charge: {restaurant.serviceChargeRate}%</div>
              <div>Currency: {restaurant.currency}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Operational Settings</h4>
            <div className="space-y-2 text-sm">
              <div>Timezone: {restaurant.timezone}</div>
              <div>Status: {restaurant.isActive ? "Active" : "Inactive"}</div>
              <div>Staff Count: {restaurant.staffCount}</div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
