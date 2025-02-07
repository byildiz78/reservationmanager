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

interface ReservationActionsProps {
  reservationId: number;
  onEdit: () => void;
}

export function ReservationActions({ reservationId, onEdit }: ReservationActionsProps) {
  const handleReservationStatus = (status: 'arrived' | 'no-show') => {
    // API call would go here
    toast({
      title: status === 'arrived' ? 'Müşteri geldi olarak işaretlendi' : 'Müşteri gelmedi olarak işaretlendi',
      description: `Rezervasyon durumu güncellendi.`,
    });
  };

  const handleSendPaymentLink = () => {
    // API call would go here
    toast({
      title: 'Ödeme linki gönderildi',
      description: 'Ödeme linki müşteriye SMS olarak gönderildi.',
    });
  };

  const handleSendSMS = () => {
    // API call would go here
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
              onClick={() => handleReservationStatus('arrived')}
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
              onClick={() => handleReservationStatus('no-show')}
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
    </div>
  );
}
