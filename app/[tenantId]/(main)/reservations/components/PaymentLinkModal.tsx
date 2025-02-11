"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast/use-toast";
import { CreditCard, Phone, Receipt, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useReservationStore } from "@/stores/reservation-store";

interface PaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  reservationId: number;
}

export function PaymentLinkModal({
  isOpen,
  onClose,
  phoneNumber,
  reservationId,
}: PaymentLinkModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { reservations } = useReservationStore();
  const reservation = reservations.find(r => r.id === reservationId);

  const handleSendPaymentLink = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir tutar giriniz",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Mock API call - in real implementation, this would call your payment system's API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Başarılı",
        description: `${phoneNumber} numaralı telefona ${amount} TL tutarında ödeme linki gönderildi.`,
        variant: "success",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ödeme linki gönderilirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Ödeme Linki Gönder
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <Card className="border-muted">
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">{phoneNumber}</span>
                </div>
                {reservation && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Receipt className="w-4 h-4" />
                    <span>Rezervasyon #{reservationId} - {reservation.customerName}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Label htmlFor="amount" className="text-base flex items-center gap-2">
              Ödeme Tutarı
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-12 text-lg h-12"
                placeholder="0.00"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
                ₺
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button 
            onClick={handleSendPaymentLink} 
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              "Gönderiliyor..."
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Gönder
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
