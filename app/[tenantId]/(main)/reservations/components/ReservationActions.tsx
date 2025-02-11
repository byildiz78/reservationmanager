"use client";

import { Check, X, CreditCard, MessageSquare, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from '@/lib/axios';
import { useState } from "react";
import { PaymentLinkModal } from "./PaymentLinkModal";

interface ReservationActionsProps {
  reservationId: number;
  onEdit: () => void;
  onUpdate?: () => void;
  phoneNumber: string;
}

export function ReservationActions({ reservationId, onEdit, onUpdate, phoneNumber }: ReservationActionsProps) {
  const handleStatusUpdate = async (status: string) => {
    try {
      const response = await api.put(`/api/postgres/update-reservation?reservationId=${reservationId}`, {
        status: status
      });

      if (response.data.success) {
        const statusLabels: { [key: string]: string } = {
          'customer_arrived': 'Müşteri geldi olarak işaretlendi',
          'customer_no_show': 'Müşteri gelmedi olarak işaretlendi'
        };

        toast({
          title: "Durum güncellendi",
          description: statusLabels[status],
          variant: "success",
        });

        if (onUpdate) {
          onUpdate();
        }
      } else {
        throw new Error(response.data.message || 'Güncelleme başarısız oldu');
      }
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast({
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleSendPaymentLink = () => {
    setIsPaymentModalOpen(true);
  };

  const handleSendSMS = () => {
    toast({
      title: 'SMS gönderildi',
      description: 'Bilgilendirme SMS\'i müşteriye gönderildi.',
    });
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Düzenle</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handleStatusUpdate('customer_arrived')}
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Müşteri Geldi</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handleStatusUpdate('customer_no_show')}
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Müşteri Gelmedi</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={handleSendPaymentLink}
            >
              <CreditCard className="h-4 w-4 text-blue-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ödeme Linki Gönder</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={handleSendSMS}
            >
              <MessageSquare className="h-4 w-4 text-purple-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>SMS Gönder</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PaymentLinkModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        phoneNumber={phoneNumber}
        reservationId={reservationId}
      />
    </div>
  );
}
