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
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Clock,
  Star,
  Users,
  Award,
  Eye,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useStaff, useStaffOperations, Staff } from "@/hooks/useStaff";

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch staff
  const {
    staff,
    pagination,
    loading: staffLoading,
    refetch: refetchStaff,
  } = useStaff({
    search: searchTerm,
    role: filterRole,
    status: filterStatus,
  });

  // Staff operations
  const {
    createStaff,
    updateStaff,
    deleteStaff,
    loading: operationsLoading,
  } = useStaffOperations();

  const handleCreateStaff = async (formData: FormData) => {
    try {
      const staffData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        role: formData.get('role') as 'manager' | 'cashier' | 'kitchen_staff' | 'server' | 'delivery',
        hourlyRate: parseFloat(formData.get('hourlyRate') as string) || 0,
        hireDate: formData.get('hireDate') as string,
        permissions: [], // Will be set based on role
      };
      await createStaff(staffData);
      setIsCreateDialogOpen(false);
      refetchStaff();
    } catch (error) {
      console.error("Failed to create staff:", error);
    }
  };

  const handleEditStaff = async (formData: FormData) => {
    if (!selectedStaff) return;
    try {
      const staffData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        role: formData.get('role') as 'manager' | 'cashier' | 'kitchen_staff' | 'server' | 'delivery',
        hourlyRate: parseFloat(formData.get('hourlyRate') as string) || 0,
        hireDate: formData.get('hireDate') as string,
      };
      await updateStaff(selectedStaff._id, staffData);
      setIsEditDialogOpen(false);
      refetchStaff();
    } catch (error) {
      console.error("Failed to update staff:", error);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      await deleteStaff(staffId);
      refetchStaff();
    } catch (error) {
      console.error("Failed to delete staff:", error);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      manager: "bg-purple-100 text-purple-800",
      cashier: "bg-blue-100 text-blue-800",
      kitchen_staff: "bg-orange-100 text-orange-800",
      server: "bg-green-100 text-green-800",
      delivery: "bg-yellow-100 text-yellow-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      manager: "Manager",
      cashier: "Cashier",
      kitchen_staff: "Kitchen Staff",
      server: "Server",
      delivery: "Delivery",
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (staffLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage your restaurant staff and their roles
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Create a new staff member account with role and permissions.
              </DialogDescription>
            </DialogHeader>
            <StaffForm onSubmit={handleCreateStaff} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(staff.reduce((sum, s) => sum + (s.performanceMetrics?.customerRating || 0), 0) / staff.length || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Customer rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(staff.reduce((sum, s) => sum + (s.hourlyRate * 40 * 4), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly estimate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Duty</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.filter(s => s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently working
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            View and manage all staff members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search staff by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="kitchen_staff">Kitchen Staff</SelectItem>
                <SelectItem value="server">Server</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {member._id.slice(-6)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(member.role)}>
                        {getRoleLabel(member.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="mr-1 h-3 w-3" />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {member.hireDate ? new Date(member.hireDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(member.hourlyRate)}/hr
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="mr-1 h-3 w-3 fill-current text-yellow-400" />
                        <span className="text-sm">
                          {member.performanceMetrics?.customerRating?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.isActive ? "default" : "secondary"}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedStaff(member);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedStaff(member);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStaff(member._id)}
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

      {/* View Staff Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
            <DialogDescription>
              Complete staff member information and performance
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <StaffDetails staff={selectedStaff} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update staff member information and role
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <StaffForm
              staff={selectedStaff}
              onSubmit={handleEditStaff}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Staff Form Component
function StaffForm({
  staff,
  onSubmit,
}: {
  staff?: Staff;
  onSubmit: (formData: FormData) => void;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={staff?.name}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={staff?.email}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={staff?.phone}
          />
        </div>
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select name="role" defaultValue={staff?.role}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="cashier">Cashier</SelectItem>
              <SelectItem value="kitchen_staff">Kitchen Staff</SelectItem>
              <SelectItem value="server">Server</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hourlyRate">Hourly Rate</Label>
          <Input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            step="0.01"
            defaultValue={staff?.hourlyRate}
          />
        </div>
        <div>
          <Label htmlFor="hireDate">Hire Date</Label>
          <Input
            id="hireDate"
            name="hireDate"
            type="date"
            defaultValue={staff?.hireDate?.split('T')[0]}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">
          {staff ? "Update Staff Member" : "Create Staff Member"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Staff Details Component
function StaffDetails({ staff }: { staff: Staff }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Contact Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                {staff.email}
              </div>
              {staff.phone && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  {staff.phone}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Employment Details</h4>
            <div className="space-y-2 text-sm">
              <div>Role: {staff.role.replace('_', ' ')}</div>
              <div>Hourly Rate: {formatCurrency(staff.hourlyRate)}</div>
              <div>
                Hire Date: {staff.hireDate ? new Date(staff.hireDate).toLocaleDateString() : 'N/A'}
              </div>
              <div>Status: {staff.isActive ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="performance" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Performance Metrics</h4>
            <div className="space-y-2 text-sm">
              <div>Orders Processed: {staff.performanceMetrics?.ordersProcessed || 0}</div>
              <div>Avg Order Time: {staff.performanceMetrics?.averageOrderTime || 0} min</div>
              <div>Customer Rating: {staff.performanceMetrics?.customerRating || 0}/5</div>
              <div>Punctuality: {staff.performanceMetrics?.punctuality || 0}%</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Certifications</h4>
            <div className="space-y-1">
              {staff.certifications?.length ? (
                staff.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline">
                    {cert}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No certifications</p>
              )}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="schedule" className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Work Schedule</h4>
          {staff.shiftSchedule ? (
            <div className="space-y-2">
              {Object.entries(staff.shiftSchedule).map(([day, schedule]) => (
                <div key={day} className="flex justify-between items-center">
                  <span className="capitalize font-medium">{day}</span>
                  {schedule?.start && schedule?.end ? (
                    <span>{schedule.start} - {schedule.end}</span>
                  ) : (
                    <span className="text-muted-foreground">Off</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No schedule set</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}