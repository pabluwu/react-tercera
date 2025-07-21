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
    </>
);

export default EmergenciaForm;