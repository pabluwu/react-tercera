import React, { useState, useEffect } from 'react';

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
    }
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

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{titulo}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {children}
            <p className="mb-2 mt-3"><strong>{mensaje}</strong></p>
            <textarea
              className={`form-control ${error ? 'is-invalid' : ''}`}
              rows="3"
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyPress}
              placeholder="Ingrese el motivo..."
              autoFocus
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {botonCancelar}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm}>
              {botonConfirmar}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;