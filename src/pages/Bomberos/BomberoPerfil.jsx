import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Layout from "../../layout/Layout";
import { fetchWithToken } from "../../api/fetchWithToken";
import { API_BASE_URL } from "../../api/apiConfig";
import { toast } from "react-toastify";

const getFirstValue = (source, keys) => {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
};

const BomberoPerfil = () => {
  const { id: bomberoId } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => fetchWithToken("/me/"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      nombres: "",
      apellido_paterno: "",
      apellido_materno: "",
      first_name: "",
      last_name: "",
      email: "",
      rut: "",
      telefono: "",
      contacto: "",
      fecha_ingreso: "",
      cia: "",
      registro: "",
      registro_cia: "",
      codigo_llamado: "",
      cargo: "",
      sexo: "",
      nacionalidad: "",
      sangre_grupo: "",
      estado_civil: "",
      profesion: "",
      direccion_detalle: "",
      imagen: null,
    },
  });

  const buildDefaultValues = useCallback((userData) => {
    const profile = userData?.profile || userData?.perfil || {};
    const nestedUser = userData?.user || {};

    const nombres =
      getFirstValue(userData, ["nombres", "first_name", "nombre"]) ||
      getFirstValue(nestedUser, ["nombres", "first_name", "nombre"]) ||
      getFirstValue(profile, ["nombres", "first_name", "nombre"]) ||
      "";
    const apellidoPaterno =
      getFirstValue(userData, ["apellido_paterno", "apellidoPaterno"]) ||
      getFirstValue(nestedUser, ["apellido_paterno", "apellidoPaterno"]) ||
      getFirstValue(profile, ["apellido_paterno", "apellidoPaterno"]) ||
      getFirstValue(userData, ["last_name", "apellidos"]) ||
      "";
    const apellidoMaterno =
      getFirstValue(userData, ["apellido_materno", "apellidoMaterno"]) ||
      getFirstValue(nestedUser, ["apellido_materno", "apellidoMaterno"]) ||
      getFirstValue(profile, ["apellido_materno", "apellidoMaterno"]) ||
      "";

    return {
      nombres,
      apellido_paterno: apellidoPaterno,
      apellido_materno: apellidoMaterno,
      first_name: nombres,
      last_name:
        [apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ") ||
        userData?.last_name ||
        "",
      email: userData?.email || getFirstValue(profile, ["email"]) || "",
      rut: profile.rut ? String(profile.rut) : "",
      telefono:
        profile.telefono !== undefined && profile.telefono !== null
          ? String(profile.telefono)
          : "",
      contacto:
        profile.contacto !== undefined && profile.contacto !== null
          ? String(profile.contacto)
          : "",
      fecha_ingreso: profile.fecha_ingreso || "",
      cia:
        profile.cia !== undefined && profile.cia !== null
          ? String(profile.cia)
          : getFirstValue(userData, ["cia", "compania", "company"]) || "",
      registro:
        profile.registro !== undefined && profile.registro !== null
          ? String(profile.registro)
          : getFirstValue(userData, ["registro"]) || "",
      registro_cia:
        profile.registro_cia !== undefined && profile.registro_cia !== null
          ? String(profile.registro_cia)
          : getFirstValue(userData, ["registro_cia"]) || "",
      codigo_llamado:
        profile.codigo_llamado !== undefined &&
        profile.codigo_llamado !== null
          ? String(profile.codigo_llamado)
          : getFirstValue(userData, ["codigo_llamado"]) || "",
      cargo:
        getFirstValue(userData, ["cargo", "rol", "role"]) ||
        getFirstValue(profile, ["cargo", "rol", "role"]) ||
        "",
      sexo:
        getFirstValue(profile, ["sexo"]) ||
        getFirstValue(userData, ["sexo"]) ||
        "",
      nacionalidad:
        getFirstValue(profile, ["nacionalidad"]) ||
        getFirstValue(userData, ["nacionalidad"]) ||
        "",
      sangre_grupo:
        getFirstValue(profile, ["sangre_grupo", "grupo_sangre"]) ||
        getFirstValue(userData, ["sangre_grupo", "grupo_sangre"]) ||
        "",
      estado_civil:
        getFirstValue(profile, ["estado_civil"]) ||
        getFirstValue(userData, ["estado_civil"]) ||
        "",
      profesion:
        getFirstValue(profile, ["profesion"]) ||
        getFirstValue(userData, ["profesion"]) ||
        "",
      direccion_detalle:
        getFirstValue(profile, ["direccion_detalle", "direccion"]) ||
        getFirstValue(userData, ["direccion_detalle", "direccion"]) ||
        "",
      imagen: null,
    };
  }, []);

  useEffect(() => {
    if (!data) return;
    reset(buildDefaultValues(data));
  }, [data, reset, buildDefaultValues]);

  const updateProfile = useMutation({
    mutationFn: (formData) =>
      fetchWithToken("/me/", {
        method: "PATCH",
        body: formData,
      }),
    onSuccess: async () => {
      toast.success("Perfil actualizado correctamente.");
      const result = await refetch();
      if (result?.data) {
        reset(buildDefaultValues(result.data));
      }
      setIsEditing(false);
    },
    onError: (err) => {
      toast.error(err?.message || "No se pudo actualizar el perfil.");
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const formData = new FormData();

    const nombres = values.nombres?.trim() || "";
    const apellidoPaterno = values.apellido_paterno?.trim() || "";
    const apellidoMaterno = values.apellido_materno?.trim() || "";
    const lastNameCombined = `${apellidoPaterno} ${apellidoMaterno}`.trim();

    formData.append("nombres", nombres);
    formData.append("apellido_paterno", apellidoPaterno);
    formData.append("apellido_materno", apellidoMaterno);
    formData.append("first_name", nombres);
    formData.append("last_name", lastNameCombined || values.last_name?.trim() || "");
    formData.append("email", values.email?.trim() || "");

    formData.append("rut", values.rut?.trim() || "");
    formData.append("telefono", values.telefono?.trim() || "");
    formData.append("contacto", values.contacto?.trim() || "");
    formData.append("fecha_ingreso", values.fecha_ingreso || "");
    formData.append("cia", values.cia?.trim() || "");
    formData.append("registro", values.registro?.trim() || "");
    formData.append("registro_cia", values.registro_cia?.trim() || "");
    formData.append("codigo_llamado", values.codigo_llamado?.trim() || "");
    formData.append("cargo", values.cargo?.trim() || "");
    formData.append("sexo", values.sexo?.trim() || "");
    formData.append("nacionalidad", values.nacionalidad?.trim() || "");
    formData.append("sangre_grupo", values.sangre_grupo?.trim() || "");
    formData.append("estado_civil", values.estado_civil?.trim() || "");
    formData.append("profesion", values.profesion?.trim() || "");
    formData.append("direccion_detalle", values.direccion_detalle?.trim() || "");

    const imagenFile =
      values.imagen && values.imagen.length > 0
        ? values.imagen[0]
        : null;
    if (imagenFile) {
      formData.append("imagen", imagenFile);
    }

    await updateProfile.mutateAsync(formData);
  });

  const handleToggleEdit = () => {
    if (isEditing && data) {
      reset(buildDefaultValues(data));
    }
    setIsEditing((prev) => !prev);
  };

  const { details, profileImage } = useMemo(() => {
    if (!data) return { details: [], profileImage: null };

    const profile = data.profile || data.perfil || {};
    const profileUser = profile.user || {};

    const nombres =
      getFirstValue(data, ["nombres", "first_name", "nombre"]) ||
      getFirstValue(data.user, ["nombres", "first_name", "nombre"]) ||
      getFirstValue(profileUser, ["nombres", "first_name", "nombre"]) ||
      getFirstValue(profile, ["nombres", "first_name", "nombre"]) ||
      "";
    const apellidoPaterno =
      getFirstValue(data, ["apellido_paterno", "apellidoPaterno"]) ||
      getFirstValue(data.user, ["apellido_paterno", "apellidoPaterno"]) ||
      getFirstValue(profileUser, ["apellido_paterno", "apellidoPaterno"]) ||
      getFirstValue(profile, ["apellido_paterno", "apellidoPaterno"]) ||
      "";
    const apellidoMaterno =
      getFirstValue(data, ["apellido_materno", "apellidoMaterno"]) ||
      getFirstValue(data.user, ["apellido_materno", "apellidoMaterno"]) ||
      getFirstValue(profileUser, ["apellido_materno", "apellidoMaterno"]) ||
      getFirstValue(profile, ["apellido_materno", "apellidoMaterno"]) ||
      "";
    const lastName =
      [apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ") ||
      getFirstValue(data, ["last_name", "apellido", "apellidos"]) ||
      getFirstValue(data.user, ["last_name", "apellido", "apellidos"]) ||
      getFirstValue(profileUser, ["last_name", "apellido", "apellidos"]) ||
      "";
    const fullName = `${nombres} ${lastName}`.trim() || "-";

    const rut =
      getFirstValue(data, ["rut", "documento", "rut_bombero"]) ||
      getFirstValue(profile, ["rut"]) ||
      "-";
    const email =
      getFirstValue(data, ["email"]) ||
      getFirstValue(data.user, ["email"]) ||
      getFirstValue(profileUser, ["email"]) ||
      "-";
    const profileImageRaw =
      getFirstValue(profile, ["imagen", "image", "foto_url"]) || null;
    const profileImage = profileImageRaw
      ? (() => {
          try {
            return new URL(profileImageRaw, API_BASE_URL).toString();
          } catch {
            return profileImageRaw;
          }
        })()
      : null;
    const phone =
      getFirstValue(data, ["telefono", "phone", "celular"]) ||
      getFirstValue(profile, ["telefono", "phone", "celular"]) ||
      "-";
    const emergencyContact =
      getFirstValue(data, ["contacto", "emergency_contact"]) ||
      getFirstValue(profile, ["contacto", "emergency_contact"]) ||
      "-";
    const company =
      getFirstValue(
        data.compania || data.company || profile.compania || profile.company,
        ["nombre", "name"]
      ) ||
      getFirstValue(data, ["compania", "company"]) ||
      "-";
    const role =
      getFirstValue(
        data.cargo || profile.cargo || data.position,
        ["nombre", "name"]
      ) ||
      getFirstValue(data, ["cargo", "rol", "role"]) ||
      "-";
    const joinDate =
      getFirstValue(profile, ["fecha_ingreso", "fechaIngreso", "join_date"]) ||
      "-";
    const cia =
      getFirstValue(profile, ["cia", "compania", "company"]) ||
      getFirstValue(data, ["cia", "compania", "company"]) ||
      "-";
    const registro =
      getFirstValue(profile, ["registro"]) ||
      getFirstValue(data, ["registro"]) ||
      "-";
    const registroCia =
      getFirstValue(profile, ["registro_cia"]) ||
      getFirstValue(data, ["registro_cia"]) ||
      "-";
    const codigoLlamado =
      getFirstValue(profile, ["codigo_llamado"]) ||
      getFirstValue(data, ["codigo_llamado"]) ||
      "-";
    const sexo =
      getFirstValue(profile, ["sexo"]) || getFirstValue(data, ["sexo"]) || "-";
    const nacionalidad =
      getFirstValue(profile, ["nacionalidad"]) ||
      getFirstValue(data, ["nacionalidad"]) ||
      "-";
    const sangreGrupo =
      getFirstValue(profile, ["sangre_grupo", "grupo_sangre"]) ||
      getFirstValue(data, ["sangre_grupo", "grupo_sangre"]) ||
      "-";
    const estadoCivil =
      getFirstValue(profile, ["estado_civil"]) ||
      getFirstValue(data, ["estado_civil"]) ||
      "-";
    const profesion =
      getFirstValue(profile, ["profesion"]) ||
      getFirstValue(data, ["profesion"]) ||
      "-";
    const direccionDetalle =
      getFirstValue(profile, ["direccion_detalle", "direccion"]) ||
      getFirstValue(data, ["direccion_detalle", "direccion"]) ||
      "-";

    const detailsList = [
      { label: "Nombre completo", value: fullName },
      { label: "Nombres", value: nombres || "-" },
      { label: "Apellido paterno", value: apellidoPaterno || "-" },
      { label: "Apellido materno", value: apellidoMaterno || "-" },
      { label: "Compañía / CIA", value: cia },
      { label: "Registro general", value: registro },
      { label: "Registro en compañía", value: registroCia },
      { label: "Código de llamado", value: codigoLlamado },
      { label: "Cargo", value: role },
      { label: "Sexo", value: sexo },
      { label: "Nacionalidad", value: nacionalidad },
      { label: "Grupo sanguíneo", value: sangreGrupo },
      { label: "Estado civil", value: estadoCivil },
      { label: "Profesión", value: profesion },
      { label: "Dirección", value: direccionDetalle },
      { label: "Correo electrónico", value: email },
      { label: "RUT", value: rut },
      { label: "Teléfono", value: phone },
      { label: "Contacto de emergencia", value: emergencyContact },
      { label: "Nombre de compañía", value: company },
      { label: "Usuario", value: getFirstValue(data, ["username"]) || "-" },
      { label: "ID de usuario", value: data.id ?? "-" },
      { label: "Fecha de ingreso", value: joinDate },
    ];

    return { details: detailsList, profileImage };
  }, [data]);

  const permissions = useMemo(() => {
    if (!data?.permissions || !Array.isArray(data.permissions)) return [];
    return data.permissions;
  }, [data]);

  const badges = useMemo(() => {
    if (!data) return [];

    const profile = data.profile || data.perfil || {};

    const estado =
      getFirstValue(data, ["estado", "status"]) ||
      getFirstValue(profile, ["estado"]) ||
      null;
    const categoria =
      getFirstValue(data, ["categoria", "category"]) ||
      getFirstValue(profile, ["categoria"]) ||
      null;

    return [
      estado && { label: "Estado", value: estado },
      categoria && { label: "Categoría", value: categoria },
    ].filter(Boolean);
  }, [data]);

  const [isEditing, setIsEditing] = useState(false);

  const mismatchedUser =
    data && bomberoId && String(data.id) !== String(bomberoId);

  return (
    <Layout>
      <div className="container rounded shadow-sm bg-white p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Mi perfil</h2>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleToggleEdit}
              disabled={isLoading || updateProfile.isLoading}
            >
              {isEditing ? "Cancelar" : "Editar"}
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        {mismatchedUser && (
          <div className="alert alert-warning">
            Estás viendo tu propio perfil. El identificador en la URL no coincide
            con el de tu sesión actual.
          </div>
        )}

        {isLoading && <div>Cargando información del perfil...</div>}

        {isError && (
          <div className="alert alert-danger" role="alert">
            {error?.message || "No se pudo obtener la información del perfil."}
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            {!isEditing ? (
              <>
                {(profileImage || badges.length > 0) && (
                  <div className="mb-3 d-flex flex-wrap gap-2">
                    {profileImage && (
                      <div
                        className="border rounded p-2 d-flex align-items-center"
                        style={{ maxWidth: 160 }}
                      >
                        <img
                          src={profileImage}
                          alt="Foto de perfil del bombero"
                          className="img-fluid rounded"
                          style={{ maxHeight: 120, objectFit: "cover" }}
                        />
                      </div>
                    )}
                    {badges.map(({ label, value }) => (
                      <span
                        key={label}
                        className="badge bg-primary-subtle text-primary"
                      >
                        {label}: {value}
                      </span>
                    ))}
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6">
                    <div className="list-group mb-3">
                      {details
                        .slice(0, Math.ceil(details.length / 2))
                        .map((item) => (
                          <div key={item.label} className="list-group-item">
                            <small className="text-muted d-block">
                              {item.label}
                            </small>
                            <span className="fw-semibold">{item.value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="list-group mb-3">
                      {details
                        .slice(Math.ceil(details.length / 2))
                        .map((item) => (
                          <div key={item.label} className="list-group-item">
                            <small className="text-muted d-block">
                              {item.label}
                            </small>
                            <span className="fw-semibold">{item.value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h5>Permisos</h5>
                  {permissions.length === 0 ? (
                    <p className="text-muted">
                      No se encontraron permisos asignados.
                    </p>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      {permissions.map((permiso) => (
                        <span key={permiso} className="badge bg-secondary">
                          {permiso}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-3">
                <h5>Editar información</h5>
                <form className="row g-3" onSubmit={onSubmit}>
                  <div className="col-md-4">
                    <label htmlFor="nombres" className="form-label">
                      Nombres
                    </label>
                    <input
                      id="nombres"
                      type="text"
                      className="form-control"
                      {...register("nombres")}
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="apellido_paterno" className="form-label">
                      Apellido paterno
                    </label>
                    <input
                      id="apellido_paterno"
                      type="text"
                      className="form-control"
                      {...register("apellido_paterno")}
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="apellido_materno" className="form-label">
                      Apellido materno
                    </label>
                    <input
                      id="apellido_materno"
                      type="text"
                      className="form-control"
                      {...register("apellido_materno")}
                    />
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="email" className="form-label">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="form-control"
                      {...register("email")}
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="rut" className="form-label">
                      RUT
                    </label>
                    <input
                      id="rut"
                      type="text"
                      className="form-control"
                      {...register("rut")}
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="sexo" className="form-label">
                      Sexo
                    </label>
                    <input
                      id="sexo"
                      type="text"
                      className="form-control"
                      {...register("sexo")}
                    />
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="telefono" className="form-label">
                      Teléfono
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      className="form-control"
                      {...register("telefono")}
                    />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="contacto" className="form-label">
                      Contacto de emergencia
                    </label>
                    <input
                      id="contacto"
                      type="tel"
                      className="form-control"
                      {...register("contacto")}
                    />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="fecha_ingreso" className="form-label">
                      Fecha de ingreso
                    </label>
                    <input
                      id="fecha_ingreso"
                      type="date"
                      className="form-control"
                      {...register("fecha_ingreso")}
                    />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="nacionalidad" className="form-label">
                      Nacionalidad
                    </label>
                    <input
                      id="nacionalidad"
                      type="text"
                      className="form-control"
                      {...register("nacionalidad")}
                    />
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="cia" className="form-label">
                      Compañía / CIA
                    </label>
                    <input
                      id="cia"
                      type="text"
                      className="form-control"
                      {...register("cia")}
                    />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="registro" className="form-label">
                      Registro general
                    </label>
                    <input
                      id="registro"
                      type="text"
                      className="form-control"
                      {...register("registro")}
                    />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="registro_cia" className="form-label">
                      Registro en compañía
                    </label>
                    <input
                      id="registro_cia"
                      type="text"
                      className="form-control"
                      {...register("registro_cia")}
                    />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="codigo_llamado" className="form-label">
                      Código de llamado
                    </label>
                    <input
                      id="codigo_llamado"
                      type="text"
                      className="form-control"
                      {...register("codigo_llamado")}
                    />
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="cargo" className="form-label">
                      Cargo
                    </label>
                    <input
                      id="cargo"
                      type="text"
                      className="form-control"
                      {...register("cargo")}
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="sangre_grupo" className="form-label">
                      Grupo sanguíneo
                    </label>
                    <input
                      id="sangre_grupo"
                      type="text"
                      className="form-control"
                      {...register("sangre_grupo")}
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="estado_civil" className="form-label">
                      Estado civil
                    </label>
                    <input
                      id="estado_civil"
                      type="text"
                      className="form-control"
                      {...register("estado_civil")}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="profesion" className="form-label">
                      Profesión
                    </label>
                    <input
                      id="profesion"
                      type="text"
                      className="form-control"
                      {...register("profesion")}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="direccion_detalle" className="form-label">
                      Dirección (detalle)
                    </label>
                    <textarea
                      id="direccion_detalle"
                      className="form-control"
                      rows="1"
                      {...register("direccion_detalle")}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="imagen" className="form-label">
                      Foto de perfil
                    </label>
                    <input
                      id="imagen"
                      type="file"
                      className="form-control"
                      accept="image/*"
                      {...register("imagen")}
                    />
                    <small className="text-muted">
                      Selecciona un archivo para actualizar la imagen.
                    </small>
                  </div>

                  <div className="col-12 d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting || updateProfile.isLoading}
                    >
                      {updateProfile.isLoading
                        ? "Guardando..."
                        : "Guardar cambios"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default BomberoPerfil;
