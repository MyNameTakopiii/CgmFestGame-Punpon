import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, Cloud, Wifi } from 'lucide-react';

interface QRCodeDisplayProps {
  url: string;
  title?: string;
  subtitle?: string;
  isCloud?: boolean;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  url,
  title = 'สแกนเพื่อโหลดรูปลงมือถือ',
  subtitle = 'เปิดกล้องมือถือแล้วส่องที่ QR Code',
  isCloud = false,
  size = 160,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center p-3.5 sm:p-4 bg-white/95 rounded-2xl border border-slate-200 shadow-md text-center max-w-xs mx-auto">
      {/* Network Badge */}
      <div className="flex items-center gap-1.5 mb-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {isCloud ? (
          <>
            <Cloud className="w-3 h-3 text-sky-500" />
            <span className="text-sky-700">Cloud Storage (สแกนได้ทุกที่ 4G/5G)</span>
          </>
        ) : (
          <>
            <Wifi className="w-3 h-3 text-amber-500" />
            <span className="text-amber-700">Local Instant QR (ทดสอบในเครื่อง)</span>
          </>
        )}
      </div>

      {/* Title */}
      <h4 className="text-xs sm:text-sm font-black text-slate-800 font-heading mb-0.5">{title}</h4>
      <p className="text-[10px] text-slate-500 mb-3">{subtitle}</p>

      {/* QR Code Container */}
      <div className="p-2.5 bg-white rounded-xl shadow-inner border border-slate-200 inline-block">
        <QRCodeSVG value={url} size={size} level="M" bgColor="#ffffff" fgColor="#0f172a" />
      </div>

      {/* Copy / Open Action Buttons */}
      <div className="flex items-center gap-2 mt-3 w-full">
        <button
          type="button"
          onClick={handleCopyLink}
          className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
          }`}
          title="คัดลอกลิงก์ไปยังคลิปบอร์ด"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 stroke-[3]" />
              <span>คัดลอกแล้ว!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>คัดลอกลิงก์</span>
            </>
          )}
        </button>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="py-1.5 px-2.5 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1 transition-all active:scale-95"
          title="เปิดดูหน้าดาวน์โหลด"
        >
          <ExternalLink className="w-3 h-3" />
          <span>เปิดดู</span>
        </a>
      </div>
    </div>
  );
};
