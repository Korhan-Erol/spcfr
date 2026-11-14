import { getNavSection } from "@/lib/constants/nav";

interface InfoModalProps {
  sectionId: string | null;
  onClose: () => void;
}

export function InfoModal({ sectionId, onClose }: InfoModalProps) {
  const section = sectionId ? getNavSection(sectionId) : undefined;

  if (!section) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(6,10,15,0.78)] p-5 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[520px] overflow-hidden rounded border border-[#354c63] bg-[#121b25] shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between border-b border-[#223040] bg-[#16222f] px-4 py-3">
          <h3 className="text-[13px] font-medium tracking-[0.08em] text-cyan-bright">
            {section.title}
          </h3>
          <button
            className="cursor-pointer border-0 bg-transparent text-lg leading-none text-[#96a8ba] transition-colors hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="px-4 py-4 text-[12px] leading-relaxed text-[#bfd0e0]">
          {section.body}
        </div>
      </div>
    </div>
  );
}
