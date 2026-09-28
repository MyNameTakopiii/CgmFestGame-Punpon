import React from 'react';
import { useGameSession } from '../../hooks/useGameSession';
import { Modal } from '../../../../shared/ui';
import { FileText } from 'lucide-react';

export const TranscriptModal: React.FC = () => {
  const { showTranscript, toggleTranscript, currentRound } = useGameSession();

  return (
    <Modal
      isOpen={showTranscript}
      onClose={toggleTranscript}
      title={
        <div className="flex items-center gap-2 text-emerald-700">
          <FileText className="w-5 h-5" />
          <h3 className="font-heading font-bold text-lg text-slate-900">
            เนื้อเพลงข้อนี้ (Transcript)
          </h3>
        </div>
      }
    >
      {currentRound ? (
        <div className="space-y-4">
          <blockquote className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 font-mono text-sm leading-relaxed shadow-inner">
            "{currentRound.sampledLyric}"
          </blockquote>
          <footer className="text-xs text-slate-500 italic">
            * เมนูนี้สำหรับตรวจสอบการทำงาน หรือช่วยผู้เล่นที่อุปกรณ์ไม่มีระบบสังเคราะห์เสียง
          </footer>
        </div>
      ) : (
        <p className="text-slate-500 text-sm">ยังไม่มีรอบการเล่นที่กำลังดำเนินอยู่</p>
      )}
    </Modal>
  );
};
