"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReservationStore } from "@/stores/reservation-store";
import { tr } from "date-fns/locale";
import { motion } from "framer-motion";
import { ReservationHeader } from "./components/ReservationHeader";
import { TimeSlots } from "./components/TimeSlots";
import { ReservationCard } from "./components/ReservationCard";
import { ReservationFormModal } from "./components/ReservationFormModal";
import { ReservationReport } from "./components/ReservationReport";
import { ChartBarIcon, CalendarDaysIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/toast/use-toast";
import { format } from "date-fns";

export default function ReservationsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSection, setSelectedSection] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { 
    reservations, 
    tables, 
    sections,
    selectedDate,
    isLoading,
    error,
    fetchReservations,
    fetchSections,
    setSelectedDate
  } = useReservationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("list");
  const params = useParams();

  const [loading, setLoading] = useState(true);

  const fetchReservationsList = async () => {
    try {
      setLoading(true);
      await fetchReservations();
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: "Hata",
        description: "Rezervasyonlar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.tenantId) {
      fetchReservationsList();
      fetchSections();
    }
  }, [params?.tenantId, fetchReservations, fetchSections]);

  useEffect(() => {
    if (date) {
      setSelectedDate(date);
    }
  }, [date, setSelectedDate]);

  const handleEdit = (reservation: any) => {
    // Pass the reservation data directly without transformation
    // The API now returns the correct structure
    setSelectedReservation(reservation);
    setShowReservationModal(true);
  };

  const handleCloseModal = () => {
    setShowReservationModal(false);
    setSelectedReservation(null);
    // Modal kapandığında rezervasyonları yenile
    fetchReservationsList();
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSection = selectedSection === 'all' || reservation.sectionId === selectedSection;
    const matchesStatus = selectedStatus === 'all' || reservation.status === selectedStatus;
    const reservationDate = new Date(reservation.reservationDate);
    const matchesDate = format(reservationDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      reservation.customerName.toLowerCase().includes(searchLower) ||
      reservation.customerPhone.toLowerCase().includes(searchLower) ||
      reservation.tableName.toLowerCase().includes(searchLower);

    return matchesSection && matchesStatus && matchesSearch && matchesDate;
  });

  const groupedReservations = filteredReservations.reduce((groups: Record<string, any[]>, reservation) => {
    const sectionName = reservation.sectionName || reservation.section?.name || '';
    
    if (!groups[sectionName]) {
      groups[sectionName] = [];
    }

    // Transform the data to a consistent format
    const transformedReservation = {
      id: reservation.id,
      customerName: reservation.customerName || reservation.customer_name,
      customerPhone: reservation.customerPhone || reservation.customer_phone,
      customerEmail: reservation.customerEmail || reservation.customer_email || '',
      guestCount: reservation.guestCount || reservation.party_size || 2,
      reservationDate: reservation.reservationDate || reservation.reservation_date,
      reservationTime: reservation.reservationTime || reservation.reservation_time,
      status: reservation.status || 'pending',
      notes: reservation.notes || '',
      specialnotes: reservation.specialnotes || '',
      is_smoking: Boolean(reservation.is_smoking),
      is_outdoor: Boolean(reservation.is_outdoor),
      is_vip: reservation.is_vip === null ? false : Boolean(reservation.is_vip),
      
      // Ensure table data is properly structured
      table: {
        table_id: Number(reservation.tableId || reservation.table?.table_id || 0),
        table_name: reservation.tableName || reservation.table?.table_name || '',
        table_capacity: reservation.tableCapacity || reservation.table?.table_capacity || 0,
        table_status: reservation.tableStatus || reservation.table?.table_status || 'available'
      },
      
      // Ensure section data is properly structured
      section: {
        id: Number(reservation.sectionId || reservation.section?.id || 0),
        name: reservation.sectionName || reservation.section?.name || '',
        description: reservation.sectionDescription || reservation.section?.description || ''
      }
    };

    groups[sectionName].push(transformedReservation);
    return groups;
  }, {});

  return (
    <div className="h-full bg-background">
      <ReservationHeader 
        totalCount={filteredReservations.length}
        pendingCount={filteredReservations.filter(r => r.status === 'pending').length}
        sections={sections}
        selectedSection={selectedSection}
        onSectionChange={setSelectedSection}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewReservation={() => {
          setSelectedReservation(null);
          setShowReservationModal(true);
        }}
      />

      <div className="grid grid-cols-[300px,1fr] h-[calc(100vh-73px)]">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="border-r p-4 bg-muted/5 space-y-6"
        >
          <div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-lg border shadow-sm bg-white dark:bg-gray-900"
              locale={tr}
              modifiers={{
                weekend: (date) => date.getDay() === 5 || date.getDay() === 6
              }}
              modifiersStyles={{
                weekend: {
                  color: 'rgb(239 68 68)',
                  fontWeight: '600',
                  backgroundColor: 'rgb(254 242 242)',
                  borderRadius: '4px'
                }
              }}
              classNames={{
                day_today: "bg-primary text-primary-foreground font-bold hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              }}
            />
            <div className="mt-6 space-y-4">
              <TimeSlots />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm">Görünüm</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab("list")}
                className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${activeTab === "list" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                  }`}
              >
                <CalendarDaysIcon className="w-4 h-4" />
                Kart
              </button>
              <button
                onClick={() => setActiveTab("report")}
                className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${activeTab === "report" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                  }`}
              >
                <ChartBarIcon className="w-4 h-4" />
                Liste
              </button>
            </div>
          </div>
        </motion.div>

        {activeTab === "list" ? (
          <ScrollArea className="h-[calc(100vh-73px)]">
            <div className="min-h-full p-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Hata</AlertTitle>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {loading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6 pb-48">
                  {Object.entries(groupedReservations).map(([sectionName, reservations]) => (
                    <div key={sectionName} className="space-y-4">
                      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                        <h2 className="text-lg font-semibold capitalize">
                          {sectionName}
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            ({reservations.length} rezervasyon)
                          </span>
                        </h2>
                      </div>
                      <div className="space-y-4">
                        {reservations.map((reservation: any, index: number) => {
                          console.log('Reservation data:', reservation);
                          return (
                            <ReservationCard
                              key={reservation.id}
                              reservation={reservation}
                              table={reservation.table}
                              section={reservation.section}
                              index={index}
                              onEdit={handleEdit}
                              onUpdate={fetchReservationsList}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {filteredReservations.length === 0 && !loading && (
                    <div className="text-center py-8 text-muted-foreground">
                      Görüntülenecek rezervasyon bulunamadı.
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <ReservationReport />
        )}
      </div>

      <ReservationFormModal 
        isOpen={showReservationModal} 
        onClose={handleCloseModal}
        initialData={selectedReservation}
        onUpdate={fetchReservationsList}
      />
    </div>
  );
}