"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Check, Copy, QrCode, RefreshCw, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatVnd } from "@/lib/format";
import { notifySuccess } from "@/lib/toast";
import { Badge, Button } from "@/components/ui/Primitives";
import {
  SEPAY_CONFIG,
  getSepayQrUrl,
  getVietQrFallbackUrl,
} from "@/lib/payment/sepay";

interface SepayPaymentBoxProps {
  orderId: string;
  amountVnd: number;
  initialPaid?: boolean;
  onPaymentSuccess?: () => void;
  className?: string;
}

export function SepayPaymentBox({
  orderId,
  amountVnd,
  initialPaid = false,
  onPaymentSuccess,
  className = "",
}: SepayPaymentBoxProps) {
  const [isPaid, setIsPaid] = useState(initialPaid);
  const [checking, setChecking] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrSrcIndex, setQrSrcIndex] = useState(0);
  const [simulating, setSimulating] = useState(false);

  const paid = isPaid || Boolean(initialPaid);

  const transferContent = orderId;
  const primaryQr = getSepayQrUrl({ amount: amountVnd, orderId });
  const fallbackQr = getVietQrFallbackUrl({ amount: amountVnd, orderId });

  const copyToClipboard = (text: string, fieldName: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      notifySuccess(`Đã sao chép ${fieldName}`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const checkStatus = useCallback(async () => {
    if (paid) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/payment/status?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (data?.paid) {
        setIsPaid(true);
        notifySuccess("Đã nhận thanh toán qua MBBank (SePay) thành công!");
        onPaymentSuccess?.();
      }
    } catch (err) {
      console.warn("Lỗi kiểm tra trạng thái thanh toán:", err);
    } finally {
      setChecking(false);
    }
  }, [isPaid, orderId, onPaymentSuccess]);

  // Polling every 3.5 seconds if unpaid
  useEffect(() => {
    if (paid) return;
    const timer = setInterval(() => {
      void checkStatus();
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaid, checkStatus]);

  // Simulate payment for test/preliminary verification
  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await fetch("/api/payment/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amountVnd }),
      });
      const data = await res.json();
      if (data?.success) {
        setIsPaid(true);
        notifySuccess("Mô phỏng thanh toán SePay thành công!");
        onPaymentSuccess?.();
      }
    } catch {
      // ignore
    } finally {
      setSimulating(false);
    }
  };

  if (paid) {
    return (
      <div className={`rounded-[16px] border border-[#245B3D] bg-[#EAF0E5] p-5 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#245B3D] text-white">
            <Check className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#245B3D]">Thanh toán hoàn tất</h3>
              <Badge tone="success">MBBank · SePay</Badge>
            </div>
            <p className="text-xs text-[#52645A]">
              Hệ thống đã nhận đủ {formatVnd(amountVnd)} cho đơn hàng <strong>{orderId}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-[16px] border border-[#D6DED2] bg-[#FAF8F1] p-5 space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAEFE6] pb-3">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
          <h3 className="font-editorial text-base font-bold text-[#25352B]">
            Thanh toán chuyển khoản VietQR (MBBank)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#D7A34D] animate-ping" />
          <span className="text-xs font-semibold text-[#80520C]">Chờ chuyển khoản...</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-12 items-center">
        {/* QR Code Container with guaranteed non-collapsing dimensions */}
        <div className="flex flex-col items-center justify-center md:col-span-5 bg-white p-4 rounded-[14px] border border-[#D6DED2]">
          <div className="flex items-center justify-center w-[210px] h-[210px] bg-white rounded-[10px] p-1.5 border border-[#EAEFE6] shadow-inner">
            {qrSrcIndex === 0 ? (
              <img
                src={primaryQr}
                alt={`Mã VietQR thanh toán đơn hàng ${orderId}`}
                width={200}
                height={200}
                className="w-[200px] h-[200px] object-contain rounded-[6px]"
                onError={() => setQrSrcIndex(1)}
              />
            ) : qrSrcIndex === 1 ? (
              <img
                src={fallbackQr}
                alt={`Mã VietQR thanh toán đơn hàng ${orderId}`}
                width={200}
                height={200}
                className="w-[200px] h-[200px] object-contain rounded-[6px]"
                onError={() => setQrSrcIndex(2)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <QRCodeSVG
                  value={`https://qr.sepay.vn/img?acc=0369966231&bank=MBBank&amount=${amountVnd}&des=${orderId}`}
                  size={190}
                  level="M"
                />
              </div>
            )}
          </div>
          <p className="mt-2.5 text-center text-[11px] font-medium text-[#52645A]">
            Quét QR bằng app Ngân hàng (MB, VCB, BIDV...) hoặc Ví điện tử
          </p>
        </div>

        {/* Bank & Transfer Details */}
        <div className="space-y-2.5 md:col-span-7 text-xs">
          <div className="flex items-center justify-between rounded-[10px] bg-white p-2.5 border border-[#EAEFE6]">
            <div>
              <span className="text-[#52645A] block text-[11px]">Ngân hàng:</span>
              <span className="font-bold text-[#25352B]">{SEPAY_CONFIG.bankDisplayName}</span>
            </div>
            <Badge tone="neutral">MBBank</Badge>
          </div>

          <div className="flex items-center justify-between rounded-[10px] bg-white p-2.5 border border-[#EAEFE6]">
            <div>
              <span className="text-[#52645A] block text-[11px]">Số tài khoản:</span>
              <span className="font-bold text-[#245B3D] text-sm tabular-nums tracking-wide">
                {SEPAY_CONFIG.accountNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(SEPAY_CONFIG.accountNumber, "số tài khoản")}
              className="inline-flex cursor-pointer items-center gap-1 rounded-[8px] border border-[#D6DED2] px-2.5 py-1 text-[11px] font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
            >
              {copiedField === "số tài khoản" ? (
                <Check className="h-3.5 w-3.5 text-[#24603B]" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-[#52645A]" />
              )}
              <span>Sao chép</span>
            </button>
          </div>

          <div className="flex items-center justify-between rounded-[10px] bg-white p-2.5 border border-[#EAEFE6]">
            <div>
              <span className="text-[#52645A] block text-[11px]">Số tiền cần chuyển:</span>
              <span className="font-bold text-[#25352B] text-sm tabular-nums">
                {formatVnd(amountVnd)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(String(amountVnd), "số tiền")}
              className="inline-flex cursor-pointer items-center gap-1 rounded-[8px] border border-[#D6DED2] px-2.5 py-1 text-[11px] font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
            >
              {copiedField === "số tiền" ? (
                <Check className="h-3.5 w-3.5 text-[#24603B]" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-[#52645A]" />
              )}
              <span>Sao chép</span>
            </button>
          </div>

          <div className="flex items-center justify-between rounded-[10px] bg-white p-2.5 border border-[#EAEFE6]">
            <div>
              <span className="text-[#52645A] block text-[11px]">Nội dung chuyển khoản (bắt buộc):</span>
              <span className="font-bold text-[#A32D2D] text-sm tracking-wide">
                {transferContent}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(transferContent, "nội dung chuyển khoản")}
              className="inline-flex cursor-pointer items-center gap-1 rounded-[8px] border border-[#D6DED2] px-2.5 py-1 text-[11px] font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
            >
              {copiedField === "nội dung chuyển khoản" ? (
                <Check className="h-3.5 w-3.5 text-[#24603B]" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-[#52645A]" />
              )}
              <span>Sao chép</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EAEFE6] pt-3">
        <div className="text-[11px] text-[#52645A]">
          Giao dịch tự động xác nhận qua SePay Webhook ngay khi tiền vào tài khoản.
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void checkStatus()}
            disabled={checking}
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Đang kiểm tra..." : "Kiểm tra ngay"}</span>
          </Button>

          {/* Test simulation button for preliminary inspection */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void handleSimulate()}
            disabled={simulating}
            className="text-xs border border-dashed border-[#D6DED2] text-[#52645A] hover:text-[#245B3D]"
            title="Mô phỏng gửi Webhook SePay để kiểm tra sơ bộ"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#D7A34D]" />
            <span>{simulating ? "Đang mô phỏng..." : "Test Webhook"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
