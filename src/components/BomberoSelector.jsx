import { CheckSquare } from 'lucide-react';

const BomberoSelector = ({ usuarios, filtro, onFiltroChange, register }) => {
    const filtrados = (usuarios || []).filter((u) => {
        return (`${u?.user.first_name} ${u?.user.last_name}`.toLowerCase().includes(filtro.toLowerCase()))
    });



    return (
        <div className="col-12">
            <label className="form-label">Filtrar bomberos</label>
            <input
                className="form-control mb-3"
                value={filtro}
                onChange={(e) => onFiltroChange(e.target.value)}
                placeholder="Buscar por nombre o apellido"
            />
            <div className="row">
                {filtrados.map((user) => (
                    <div key={user.id} className="col-md-4">
                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                {...register('bomberos')}
                                value={user?.user.id}
                                id={`bombero-${user?.user.id}`}
                            />
                            <label className="form-check-label" htmlFor={`bombero-${user?.user.id}`}>
                                <CheckSquare size={16} className="me-1" />
                                {user?.user.first_name} {user?.user.last_name}
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BomberoSelector;
