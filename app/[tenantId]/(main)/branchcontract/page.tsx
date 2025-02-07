
'use client'

import { useState } from "react"
import { useFilterStore } from "@/stores/filters-store"
import { useTabStore } from '@/stores/tab-store'
import { useBranchContractStore } from "@/stores/branch-contract-store"
import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar, Eye, FileText, Filter, Plus, Search, Star, Store } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn, formatDateTime } from "@/lib/utils"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ContractManagementPage() {
    const { selectedFilter } = useFilterStore()
    const { activeTab } = useTabStore()
    const { contracts } = useBranchContractStore();
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [priorityFilter, setPriorityFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const statusOptions = [
        { value: "all", label: "Tüm Durumlar" },
        { value: "pending", label: "Beklemede" },
        { value: "approved", label: "Onaylandı" },
        { value: "rejected", label: "Reddedildi" }
    ]

    const priorityOptions = [
        { value: "all", label: "Tüm Öncelikler" },
        { value: "high", label: "Yüksek" },
        { value: "medium", label: "Orta" },
        { value: "low", label: "Düşük" }
    ]

    return (
        <div className="flex-1 space-y-4 p-4 md:p-2 pt-2 h-[calc(85vh-4rem)] flex flex-col">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        Bayi Sözleşme Yönetimi
                    </h2>
                    <p className="text-[0.925rem] text-muted-foreground">
                        Bayi sözleşmelerini yönetin ve takip edin
                    </p>
                </div>
                <Button
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30 transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => setShowCreateForm(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Sözleşme
                </Button>
            </div>

            <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-2 border-blue-100/50 dark:border-blue-900/20 shadow-lg shadow-blue-500/5">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                <Input
                                    placeholder="Sözleşme ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-white/80 dark:bg-gray-800/80 border-2 border-blue-100 dark:border-blue-900/30 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-200"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="border-0 shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex-1 overflow-hidden rounded-xl">
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 h-full flex flex-col">
                    <div className="flex-1 overflow-auto">
                        <Table className="relative w-full">
                            <TableHeader className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Başlık</TableHead>
                                    <TableHead>Şube</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead>İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">
                                        Henüz sözleşme bulunmamaktadır.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </Card>
        </div>
    )
}
