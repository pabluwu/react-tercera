import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';

const ModalConfirmacion = ({
  isOpen,
  onClose,
  onConfirm,
  titulo = 'Confirmar acción',
  mensaje = 'Por favor ingrese el motivo:',
  botonConfirmar = 'Confirmar',
  botonCancelar = 'Cancelar',
  requireMotivo = true,
  children
}) => {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      setError('');
      // Prevenir el scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleConfirm = () => {
    if (requireMotivo && !motivo.trim()) {
      setError('El motivo es requerido');
      return;
    }
    onConfirm(motivo.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
    >
      <div 
        className="bg-white dark:!bg-slate-900 w-full max-w-lg max-h-[90vh] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h5 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{titulo}</h5>
          <button 
            type="button" 
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {children && (
            <div className="space-y-4">
              {children}
            </div>
          )}
          
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                {mensaje}
            </p>
            <textarea
              className={`
                w-full bg-slate-50 dark:!bg-slate-800 border-none rounded-2xl py-3.5 px-5 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 transition-all outline-none min-h-[100px]
                ${error ? 'ring-2 ring-red-500/20 placeholder:text-red-300' : 'focus:ring-red-500/20 focus:bg-white dark:focus:bg-slate-700'}
              `}
              rows="3"
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyPress}
              placeholder="Escriba aquí el motivo..."
              autoFocus
            />
            {error && (
                <p className="text-xs font-bold text-red-500 pl-1 animate-in shake duration-300">
                    {error}
                </p>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-end gap-3 p-6 bg-slate-50 dark:!bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button 
            type="button" 
            className="px-6 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            onClick={onClose}
          >
            {botonCancelar}
          </button>
          <button 
            type="button" 
            className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 dark:shadow-none transition-all transform active:scale-95"
            onClick={handleConfirm}
          >
            {botonConfirmar}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalConfirmacion;
