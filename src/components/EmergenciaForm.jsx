const EmergenciaForm = ({ register }) => (
    <>
        <div className="col-md-4">
            <label className="form-label">Clave</label>
            <input className="form-control" {...register('clave')} />
        </div>
        <div className="col-md-4">
            <label className="form-label">Fecha y hora</label>
            <input type="datetime-local" className="form-control" {...register('fecha')} />
        </div>
        <div className="col-md-4">
            <label className="form-label">Unidades</label>
            <input className="form-control" {...register('unidades')} />
        </div>
        <div className="col-md-4">
            <div className="form-check mt-4">
                <input type="checkbox" className="form-check-input" id="is_declarado" {...register('is_declarado')} />
                <label className="form-check-label" htmlFor="is_declarado">Es X1 (Declarado)</label>
            </div>
        </div>
    </>
);

export default EmergenciaForm;