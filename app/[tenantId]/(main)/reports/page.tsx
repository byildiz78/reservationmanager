"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ReservationCalendar } from "./components/ReservationCalendar";
import { ReservationList } from "./components/ReservationList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import axios from "@/lib/axios"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [testing, setTesting] = useState(false);
  const params = useParams();

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const basePath = process.env.NEXT_PUBLIC_BASEPATH || '';
      const response = await axios.get(`/api/postgres/db-test`, {
        headers: {
          'X-Tenant-ID': params.tenantId as string
        }
      });
      const data = await response.data;
      
      if (data.success) {
        toast.success("Veritabanı bağlantısı başarılı!");
      } else {
        toast.error("Veritabanı bağlantısı başarısız!" + (data.error ? `: ${data.error}` : ""));
      }
    } catch (error) {
      toast.error("Bağlantı hatası: " + (error as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="border-b">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold">Raporlar</h1>
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={testing}
              >
                {testing ? "Test Ediliyor..." : "DB Bağlantı Testi"}
              </Button>
            </div>
            <TabsList>
              <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
              <TabsTrigger value="calendar">Rezervasyon Takvimi</TabsTrigger>
              <TabsTrigger value="list">Rezervasyon Listesi</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="overview" className="flex-1 p-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setActiveTab("calendar")}
            >
              <h3 className="font-medium mb-2">Doluluk Raporu</h3>
              <p className="text-sm text-muted-foreground">
                Günlük, haftalık ve aylık doluluk oranları
              </p>
            </Card>
            
            <Card 
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setActiveTab("calendar")}
            >
              <h3 className="font-medium mb-2">Rezervasyon Raporu</h3>
              <p className="text-sm text-muted-foreground">
                Rezervasyon istatistikleri ve analizi
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="flex-1 p-6 mt-0">
          <ReservationCalendar />
        </TabsContent>

        <TabsContent value="list" className="flex-1 p-6 mt-0">
          <ReservationList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
