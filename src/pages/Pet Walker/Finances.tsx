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
      <h2 className="text-xl md:text-2xl font-bold">Finance Overview</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <DollarSign className="h-5 w-5" />
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Monthly Filter */}
          <div className="space-y-2">
            <Label htmlFor="monthFilter" className="text-sm md:text-base">
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
                <SelectItem value="2025-08">August 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date-wise Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm md:text-base">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm md:text-base">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          <Button className="w-full text-sm md:text-base">Apply Filters</Button>

          {/* Financial data */}
          <div className="space-y-3 pt-4 border-t mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm md:text-base">Total Earnings:</span>
                <span className="font-semibold text-sm md:text-base">
                  ₹65,000
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm md:text-base">Pending Payments:</span>
                <span className="font-semibold text-sm md:text-base">
                  ₹8,000
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm md:text-base">Last Payout:</span>
                <span className="font-semibold text-sm md:text-base">
                  2 days ago
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm md:text-base">Walks Completed:</span>
                <span className="font-semibold text-sm md:text-base">68</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm md:text-base">Upcoming Payout:</span>
              <span className="font-semibold text-sm md:text-base text-blue-600">
                ₹5,000 (Next Friday)
              </span>
            </div>
          </div>

          <Button
            className="mt-4 w-full text-sm md:text-base"
            variant="secondary"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Payouts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finances;
