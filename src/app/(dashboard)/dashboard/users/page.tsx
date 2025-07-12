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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Shield,
  Calendar,
  Users,
  UserCheck,
  UserX,
  Settings,
  Eye,
  Key,
} from "lucide-react";
import { useUsers, useUserOperations, User } from "@/hooks/useUsers";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);

  // Fetch users
  const {
    users,
    pagination,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useUsers({
    search: searchTerm,
    role: filterRole,
    status: filterStatus,
  });

  // User operations
  const {
    createUser,
    updateUser,
    deleteUser,
    updatePermissions,
    loading: operationsLoading,
  } = useUserOperations();

  const handleCreateUser = async (formData: FormData) => {
    try {
      const userData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as 'super_admin' | 'manager' | 'cashier' | 'kitchen_staff' | 'server' | 'delivery',
        restaurantId: formData.get('restaurantId') as string,
      };
      await createUser(userData);
      setIsCreateDialogOpen(false);
      refetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleEditUser = async (formData: FormData) => {
    if (!selectedUser) return;
    try {
      const userData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as 'super_admin' | 'manager' | 'cashier' | 'kitchen_staff' | 'server' | 'delivery',
        restaurantId: formData.get('restaurantId') as string,
      };
      await updateUser(selectedUser._id, userData);
      setIsEditDialogOpen(false);
      refetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      refetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleUpdatePermissions = async (userId: string, permissions: string[]) => {
    try {
      await updatePermissions(userId, permissions);
      refetchUsers();
      setIsPermissionsDialogOpen(false);
    } catch (error) {
      console.error("Failed to update permissions:", error);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      super_admin: "bg-red-100 text-red-800",
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
      super_admin: "Super Admin",
      manager: "Manager",
      cashier: "Cashier", 
      kitchen_staff: "Kitchen Staff",
      server: "Server",
      delivery: "Delivery",
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (usersLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with role and permissions.
              </DialogDescription>
            </DialogHeader>
            <UserForm onSubmit={handleCreateUser} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              System accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'super_admin' || u.role === 'manager').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Admin users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => !u.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Disabled accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            Manage all system users and their access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users by name or email..."
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
                <SelectItem value="super_admin">Super Admin</SelectItem>
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
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.permissions?.length || 0} permissions
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-1 h-3 w-3" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.restaurantId || 'All Restaurants'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "default" : "secondary"}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsPermissionsDialogOpen(true);
                          }}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
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

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete user information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserDetails user={selectedUser} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              user={selectedUser}
              onSubmit={handleEditUser}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Update user permissions and access rights
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <PermissionsForm
              user={selectedUser}
              onUpdate={handleUpdatePermissions}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// User Form Component
function UserForm({
  user,
  onSubmit,
}: {
  user?: User;
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
            defaultValue={user?.name}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select name="role" defaultValue={user?.role}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="cashier">Cashier</SelectItem>
              <SelectItem value="kitchen_staff">Kitchen Staff</SelectItem>
              <SelectItem value="server">Server</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="restaurantId">Restaurant ID</Label>
          <Input
            id="restaurantId"
            name="restaurantId"
            defaultValue={user?.restaurantId}
            placeholder="Leave empty for all restaurants"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">
          {user ? "Update User" : "Create User"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// User Details Component
function UserDetails({ user }: { user: User }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">User Information</h4>
            <div className="space-y-2 text-sm">
              <div>Name: {user.name}</div>
              <div>Email: {user.email}</div>
              <div>Role: {user.role}</div>
              <div>Status: {user.isActive ? 'Active' : 'Inactive'}</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Access Details</h4>
            <div className="space-y-2 text-sm">
              <div>Restaurant: {user.restaurantId || 'All Restaurants'}</div>
              <div>Permissions: {user.permissions?.length || 0}</div>
              <div>Created: {new Date(user.createdAt).toLocaleDateString()}</div>
              <div>Updated: {new Date(user.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="permissions" className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Current Permissions</h4>
          <div className="grid grid-cols-2 gap-2">
            {user.permissions?.length ? (
              user.permissions.map((permission, index) => (
                <Badge key={index} variant="outline">
                  {permission}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No permissions assigned</p>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// Permissions Form Component
function PermissionsForm({ 
  user, 
  onUpdate 
}: { 
  user: User; 
  onUpdate: (userId: string, permissions: string[]) => void;
}) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(user.permissions || []);

  const allPermissions = [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'restaurant:create', 'restaurant:read', 'restaurant:update', 'restaurant:delete',
    'menu:create', 'menu:read', 'menu:update', 'menu:delete',
    'order:create', 'order:read', 'order:update', 'order:delete', 'order:cancel',
    'inventory:create', 'inventory:read', 'inventory:update', 'inventory:delete',
    'customer:create', 'customer:read', 'customer:update', 'customer:delete',
    'reports:read', 'reports:export', 'financials:read', 'analytics:read',
    'kitchen:read', 'kitchen:update',
    'system:admin', 'system:settings'
  ];

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permission]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
    }
  };

  const handleSubmit = () => {
    onUpdate(user._id, selectedPermissions);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {allPermissions.map((permission) => (
          <div key={permission} className="flex items-center space-x-2">
            <Checkbox
              id={permission}
              checked={selectedPermissions.includes(permission)}
              onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
            />
            <Label htmlFor={permission} className="text-sm">
              {permission}
            </Label>
          </div>
        ))}
      </div>
      
      <DialogFooter>
        <Button onClick={handleSubmit}>
          Update Permissions
        </Button>
      </DialogFooter>
    </div>
  );
}