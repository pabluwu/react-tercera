const CitacionSelector = ({ citaciones, register }) => (
    <div className="col-md-6">
        <label className="form-label">Citación</label>
        <select {...register('citacion_id')} className="form-select">
            <option value="">Seleccione una citación</option>
            {(citaciones || []).map((c) => (
                <option key={c.id} value={c.id}>
                    {c.nombre} - {new Date(c.fecha).toLocaleString()}
                </option>
            ))}
        </select>
    </div>
);

export default CitacionSelector;