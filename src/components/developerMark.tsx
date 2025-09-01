import React from 'react';

const DeveloperMark: React.FC = () => {
  return (
  <div className="fixed bottom-2 right-2 flex flex-row items-center gap-4 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl shadow-lg z-50 text-sm" style={{boxShadow: '0 4px 24px rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)'}}>
      <span className="flex items-center gap-1">
        <span className="font-semibold text-cyan-300">Developer:</span>
        <strong className="text-white">Md.Pranto Islam</strong>
      </span>
      <span className="flex items-center gap-1">
        <span className="font-semibold text-cyan-300">Contact:</span>
        <strong className="text-white">01979728818</strong>
      </span>
    </div>
  );
};

export default DeveloperMark;
