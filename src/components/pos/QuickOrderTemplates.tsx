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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Zap, Edit, Trash2, Save } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/utils";

interface QuickTemplate {
  id: string;
  name: string;
  description: string;
  items: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
}

export default function QuickOrderTemplates() {
  const [templates, setTemplates] = useState<QuickTemplate[]>([
    {
      id: "1",
      name: "Family Combo",
      description: "2 Burgers, 1 Large Fries, 2 Drinks",
      items: [
        { menuItemId: "1", name: "Classic Burger", quantity: 2, price: 12.99 },
        { menuItemId: "2", name: "Large Fries", quantity: 1, price: 4.99 },
        { menuItemId: "3", name: "Soft Drink", quantity: 2, price: 2.99 },
      ],
      totalPrice: 33.96,
    },
    {
      id: "2",
      name: "Breakfast Special",
      description: "Eggs, Bacon, Toast, Coffee",
      items: [
        { menuItemId: "4", name: "Scrambled Eggs", quantity: 1, price: 8.99 },
        { menuItemId: "5", name: "Crispy Bacon", quantity: 1, price: 4.99 },
        { menuItemId: "6", name: "Toast", quantity: 2, price: 2.99 },
        { menuItemId: "7", name: "Coffee", quantity: 1, price: 2.99 },
      ],
      totalPrice: 19.96,
    },
  ]);

  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const { currentOrder, addItem, clearOrder } = useOrders();

  const applyTemplate = (template: QuickTemplate) => {
    clearOrder();
    template.items.forEach((item) => {
      addItem(item);
    });
  };

  const saveCurrentOrderAsTemplate = () => {
    if (currentOrder.items.length === 0) return;

    const newTemplate: QuickTemplate = {
      id: Date.now().toString(),
      name: templateName || `Template ${templates.length + 1}`,
      description: templateDescription || "Custom template",
      items: currentOrder.items,
      totalPrice: currentOrder.total,
    };

    setTemplates([...templates, newTemplate]);
    setTemplateName("");
    setTemplateDescription("");
    setShowCreateTemplate(false);
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter((t) => t.id !== templateId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Quick Order Templates</h2>
          <p className="text-gray-600">
            Pre-configured orders for faster service
          </p>
        </div>

        <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
          <DialogTrigger asChild>
            <Button disabled={currentOrder.items.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Save Current Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Order as Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Family Combo, Lunch Special"
                />
              </div>

              <div>
                <Label htmlFor="templateDescription">Description</Label>
                <Input
                  id="templateDescription"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Brief description of the template"
                />
              </div>

              <div className="space-y-2">
                <Label>Items in Template:</Label>
                <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                  {currentOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200 font-medium">
                    Total: {formatCurrency(currentOrder.total)}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateTemplate(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={saveCurrentOrderAsTemplate} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTemplate(template.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Template Items */}
              <ScrollArea className="h-24">
                <div className="space-y-1">
                  {template.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.name}
                      </span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Total and Action */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <Badge variant="secondary" className="text-lg">
                    {formatCurrency(template.totalPrice)}
                  </Badge>
                </div>

                <Button
                  onClick={() => applyTemplate(template)}
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Apply Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No quick order templates yet</p>
                <p className="text-sm mt-1">
                  Create orders and save them as templates for faster service
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
