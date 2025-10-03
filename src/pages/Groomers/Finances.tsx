import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
            <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
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
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm md:text-base">
                Start Date
              </Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm md:text-base">
                End Date
              </Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <Button className="w-full">Apply Filters</Button>

          <div className="space-y-2 pt-4 border-t mt-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0">
              <span className="text-sm md:text-base">Total Revenue:</span>
              <span className="font-semibold text-sm md:text-base">₹85,000</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0">
              <span className="text-sm md:text-base">Outstanding Payments:</span>
              <span className="font-semibold text-sm md:text-base">₹12,500</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0">
              <span className="text-sm md:text-base">Last Payout:</span>
              <span className="font-semibold text-sm md:text-base">3 days ago</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0">
              <span className="text-sm md:text-base">Grooming Sessions Completed:</span>
              <span className="font-semibold text-sm md:text-base">42</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0">
              <span className="text-sm md:text-base">Upcoming Billing:</span>
              <span className="font-semibold text-sm md:text-base">₹8,300 (Next Week)</span>
            </div>
          </div>
          <Button className="mt-4 w-full" variant="secondary">
            <CreditCard className="h-4 w-4 mr-2" /> Manage Payouts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finances;
