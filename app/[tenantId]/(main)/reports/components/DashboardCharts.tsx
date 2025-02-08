import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReservationStore } from "@/stores/reservation-store";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, isSameMonth, isSameWeek } from "date-fns";
import { tr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { useState } from "react";

const COLORS = {
  primary: "#6366f1",
  secondary: "#818cf8",
  success: "#34d399",
  background: "#f8fafc",
  text: "#1e293b",
  accent1: "#f43f5e",
  accent2: "#8b5cf6",
  accent3: "#06b6d4"
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-sm text-gray-600">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm">
            <span className="font-medium">{item.name}: </span>
            <span className="text-indigo-600">{item.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardCharts() {
  const { reservations } = useReservationStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Tarih aralığına göre filtrelenmiş rezervasyonlar
  const filteredReservations = reservations.filter(r => {
    const reservationDate = new Date(r.reservationDate);
    return dateRange?.from && dateRange?.to && 
           reservationDate >= startOfDay(dateRange.from) && 
           reservationDate <= endOfDay(dateRange.to);
  });

  // Bölümlere göre rezervasyon sayıları
  const sectionData = filteredReservations.reduce((acc, curr) => {
    const section = curr.sectionName;
    acc[section] = (acc[section] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sectionChartData = Object.entries(sectionData)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value
    }));

  // Günlük, Haftalık ve Aylık istatistikler
  const getStatistics = () => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const interval = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to
    });

    const stats = interval.map(date => {
      const dayReservations = filteredReservations.filter(r => 
        format(new Date(r.reservationDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      );

      const weekReservations = filteredReservations.filter(r => 
        isSameWeek(new Date(r.reservationDate), date, { locale: tr })
      );

      const monthReservations = filteredReservations.filter(r => 
        isSameMonth(new Date(r.reservationDate), date)
      );

      return {
        date: format(date, "d MMM", { locale: tr }),
        günlük: dayReservations.length,
        haftalık: weekReservations.length,
        aylık: monthReservations.length,
        label: format(date, "EEEE", { locale: tr })
      };
    });

    // ViewMode'a göre veriyi grupla
    if (viewMode === 'weekly') {
      return stats.filter((_, index) => index % 7 === 0);
    } else if (viewMode === 'monthly') {
      return stats.filter((_, index) => index % 30 === 0);
    }
    return stats;
  };

  // Saatlik rezervasyon dağılımı
  const hourlyData = filteredReservations.reduce((acc, curr) => {
    const hour = curr.reservationTime.split(":")[0];
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timeChartData = Object.entries(hourlyData)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([hour, count]) => ({
      hour: `${hour}:00`,
      count
    }));

  // Toplam istatistikler
  const totalStats = {
    daily: filteredReservations.length,
    weekly: new Set(filteredReservations.map(r => 
      format(new Date(r.reservationDate), 'w-yyyy')
    )).size,
    monthly: new Set(filteredReservations.map(r => 
      format(new Date(r.reservationDate), 'M-yyyy')
    )).size
  };

  const pieChartData = [
    { name: 'Günlük Ort.', value: Math.round(totalStats.daily / (dateRange?.from && dateRange?.to ? 
      Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) : 1)) },
    { name: 'Haftalık Ort.', value: Math.round(totalStats.daily / totalStats.weekly) },
    { name: 'Aylık Ort.', value: Math.round(totalStats.daily / totalStats.monthly) }
  ];

  return (
    <div className="space-y-4">
      {/* Tarih Aralığı ve Görünüm Seçimi */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "d LLL", { locale: tr })} -{" "}
                      {format(dateRange.to, "d LLL", { locale: tr })}
                    </>
                  ) : (
                    format(dateRange.from, "d LLL", { locale: tr })
                  )
                ) : (
                  <span>Tarih Seçin</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={tr}
              />
            </PopoverContent>
          </Popover>

          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Görünüm Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Günlük</SelectItem>
              <SelectItem value="weekly">Haftalık</SelectItem>
              <SelectItem value="monthly">Aylık</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <div className="text-sm">
            <span className="font-medium">Toplam Rezervasyon: </span>
            <span className="text-indigo-600">{totalStats.daily}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Haftalık Ortalama: </span>
            <span className="text-indigo-600">{Math.round(totalStats.daily / totalStats.weekly)}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Aylık Ortalama: </span>
            <span className="text-indigo-600">{Math.round(totalStats.daily / totalStats.monthly)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Bölümlere Göre Rezervasyonlar */}
        <Card className="col-span-1 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Bölümlere Göre Rezervasyonlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: COLORS.text, fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fill: COLORS.text }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill={COLORS.primary}
                    name="Rezervasyon Sayısı"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  >
                    {sectionChartData.map((entry, index) => (
                      <Cell key={index} fill={`${COLORS.primary}${Math.max(40, 100 - (index * 10)).toString(16)}`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rezervasyon Trendi */}
        <Card className="col-span-1 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Rezervasyon Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getStatistics()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.accent1} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.accent1} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.accent2} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.accent2} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: COLORS.text, fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: COLORS.text }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="günlük"
                    stroke={COLORS.primary}
                    fill="url(#colorDaily)"
                    name="Günlük"
                    stackId="1"
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="haftalık"
                    stroke={COLORS.accent1}
                    fill="url(#colorWeekly)"
                    name="Haftalık"
                    stackId="2"
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="aylık"
                    stroke={COLORS.accent2}
                    fill="url(#colorMonthly)"
                    name="Aylık"
                    stackId="3"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ortalama İstatistikler */}
        <Card className="col-span-1 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Ortalama İstatistikler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[COLORS.primary, COLORS.accent1, COLORS.accent2][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Saatlik Rezervasyon Dağılımı */}
        <Card className="col-span-1 lg:col-span-3 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Saatlik Rezervasyon Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fill: COLORS.text, fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: COLORS.text }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke={COLORS.primary}
                    name="Rezervasyon Sayısı"
                    strokeWidth={2}
                    dot={{ fill: COLORS.primary, strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: COLORS.secondary }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
