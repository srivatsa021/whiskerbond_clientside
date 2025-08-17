import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DollarSign, CreditCard } from "lucide-react";

const Finances = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-lg md:text-2xl font-bold">Finance Overview</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="monthFilter" className="text-sm">
                View by Month
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025-01">January 2025</SelectItem>
                  <SelectItem value="2025-02">February 2025</SelectItem>
                  <SelectItem value="2025-03">March 2025</SelectItem>
                  <SelectItem value="2025-04">April 2025</SelectItem>
                  <SelectItem value="2025-05">May 2025</SelectItem>
                  <SelectItem value="2025-06">June 2025</SelectItem>
                  <SelectItem value="2025-07">July 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <Button className="w-full" size="sm">
              Apply Filters
            </Button>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Total Revenue:</span>
                  <span className="font-semibold text-green-600">₹85,000</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">
                    Outstanding Payments:
                  </span>
                  <span className="font-semibold text-orange-600">₹12,500</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Last Payout:</span>
                  <span className="font-semibold">3 days ago</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">
                    Sessions Completed:
                  </span>
                  <span className="font-semibold">42</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Upcoming Billing:</span>
                  <span className="font-semibold text-blue-600">₹8,300</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Next Week:</span>
                  <span className="font-semibold text-gray-600">
                    Revenue Due
                  </span>
                </div>
              </div>
            </div>
            <Button className="mt-4 w-full" variant="secondary" size="sm">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Payouts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finances;
