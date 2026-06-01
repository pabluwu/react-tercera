import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Layout from "../../layout/Layout";
import { fetchWithToken } from "../../api/fetchWithToken";
import { API_BASE_URL } from "../../api/apiConfig";
import { toast } from "react-toastify";
import { 
  User, 
  Edit3, 
  RefreshCw, 
  Camera, 
  XCircle, 
  Shield, 
  Info,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  Save,
  ChevronLeft
} from "lucide-react";

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

  const { details, profileImage, fullName, initials, role, cia, email, phone } = useMemo(() => {
    if (!data) return { details: [], profileImage: null, fullName: "", initials: "", role: "", cia: "", email: "", phone: "" };

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
    const initials = (nombres[0] || "") + (lastName[0] || "");

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
      { label: "Nombres", value: nombres || "-", icon: User },
      { label: "Apellido paterno", value: apellidoPaterno || "-", icon: User },
      { label: "Apellido materno", value: apellidoMaterno || "-", icon: User },
      { label: "Compañía / CIA", value: cia, icon: Shield },
      { label: "Registro general", value: registro, icon: CreditCard },
      { label: "Registro en compañía", value: registroCia, icon: CreditCard },
      { label: "Código de llamado", value: codigoLlamado, icon: Phone },
      { label: "Cargo", value: role, icon: Shield },
      { label: "Sexo", value: sexo, icon: User },
      { label: "Nacionalidad", value: nacionalidad, icon: Info },
      { label: "Grupo sanguíneo", value: sangreGrupo, icon: Info },
      { label: "Estado civil", value: estadoCivil, icon: Info },
      { label: "Profesión", value: profesion, icon: Info },
      { label: "Dirección", value: direccionDetalle, icon: MapPin },
      { label: "Correo electrónico", value: email, icon: Mail },
      { label: "RUT", value: rut, icon: CreditCard },
      { label: "Teléfono", value: phone, icon: Phone },
      { label: "Contacto de emergencia", value: emergencyContact, icon: Phone },
      { label: "Nombre de compañía", value: company, icon: Shield },
      { label: "Usuario", value: getFirstValue(data, ["username"]) || "-", icon: User },
      { label: "Fecha de ingreso", value: joinDate, icon: Calendar },
    ];

    return { details: detailsList, profileImage, fullName, initials, role, cia, email, phone };
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
      estado && { label: "Estado", value: estado, color: "blue" },
      categoria && { label: "Categoría", value: categoria, color: "red" },
    ].filter(Boolean);
  }, [data]);

  const [isEditing, setIsEditing] = useState(false);

  const mismatchedUser =
    data && bomberoId && String(data.id) !== String(bomberoId);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Mi Perfil</h2>
            {isFetching && <RefreshCw size={20} className="animate-spin text-red-600" />}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-200 w-full sm:w-auto ${
                isEditing 
                  ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:!bg-slate-700 dark:text-white" 
                  : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
              }`}
              onClick={handleToggleEdit}
              disabled={isLoading || updateProfile.isLoading}
            >
              {isEditing ? (
                <>
                  <ChevronLeft size={20} /> Cancelar
                </>
              ) : (
                <>
                  <Edit3 size={20} /> Editar Perfil
                </>
              )}
            </button>
            {!isEditing && (
              <button
                className="flex items-center justify-center gap-2 px-5 py-2.5 !bg-white dark:!bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 w-full sm:w-auto"
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw size={20} className={isFetching ? "animate-spin" : ""} />
                Actualizar
              </button>
            )}
          </div>
        </div>

        {mismatchedUser && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-amber-50 dark:!bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-900/30">
            <Info className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm font-medium">
              Estás viendo tu propio perfil. El identificador en la URL no coincide con el de tu sesión actual.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="!bg-white dark:!bg-slate-800 rounded-3xl shadow-xl p-12 text-center border border-slate-100 dark:border-slate-700">
             <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mb-4"></div>
             <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Cargando información del perfil...</p>
          </div>
        )}

        {isError && (
          <div className="!bg-white dark:!bg-slate-800 rounded-3xl shadow-xl p-12 text-center border border-red-100 dark:border-red-900/30">
            <XCircle size={48} className="mx-auto text-red-600 mb-4" />
            <p className="text-red-700 dark:text-red-400 font-bold text-lg mb-2">Error al cargar perfil</p>
            <p className="text-slate-500 dark:text-slate-400">{error?.message || "No se pudo obtener la información."}</p>
          </div>
        )}

        {!isLoading && !isError && data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-8">
              {/* Profile Card */}
              <div className="!bg-white dark:!bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden text-center p-8 relative">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-red-600 to-red-800"></div>
                
                <div className="relative mt-4 mb-6 inline-block">
                  <div className="w-32 h-32 rounded-3xl bg-slate-100 dark:!bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden mx-auto flex items-center justify-center">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-black text-slate-300 dark:text-slate-600 uppercase">
                        {initials}
                      </span>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-900">
                      <Shield size={16} />
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{fullName}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold mb-6 flex items-center justify-center gap-1">
                  {role} <span className="text-slate-300">•</span> {cia}
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {badges.map(({ label, value, color }) => (
                    <span
                      key={label}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                        color === 'red' 
                          ? 'bg-red-50 text-red-600 dark:!bg-red-900/20 dark:text-red-400' 
                          : 'bg-blue-50 text-blue-600 dark:!bg-blue-900/20 dark:text-blue-400'
                      }`}
                    >
                      {label}: {value}
                    </span>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Mail size={18} className="text-red-600" />
                    <span className="text-sm font-medium truncate">{email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Phone size={18} className="text-red-600" />
                    <span className="text-sm font-medium">{phone}</span>
                  </div>
                </div>
              </div>

              {/* Permissions Card */}
              <div className="!bg-white dark:!bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8">
                <h4 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Shield size={20} className="text-red-600" /> Permisos asignados
                </h4>
                {permissions.length === 0 ? (
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium italic">
                    No hay permisos especiales asignados.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {permissions.map((permiso) => (
                      <span key={permiso} className="px-3 py-1.5 bg-slate-50 dark:!bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold border border-slate-100 dark:border-slate-700">
                        {permiso}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Column */}
            <div className="lg:col-span-8">
              {!isEditing ? (
                <div className="!bg-white dark:!bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h4 className="text-xl font-black text-slate-800 dark:text-white">Detalles del Personal</h4>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:!bg-slate-800 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">ID: {data.id}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 dark:!bg-slate-800">
                    {details.map((item) => (
                      <div key={item.label} className="!bg-white dark:!bg-slate-900 p-6 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="p-3 bg-red-50 dark:!bg-red-900/10 rounded-2xl text-red-600 dark:text-red-400 shrink-0 h-fit">
                          <item.icon size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                            {item.label}
                          </p>
                          <p className="text-slate-800 dark:text-slate-200 font-bold leading-tight">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="!bg-white dark:!bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-10">
                  <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
                    <Edit3 size={24} className="text-red-600" /> Editar información
                  </h4>
                  
                  <form onSubmit={onSubmit} className="space-y-8">
                    {/* Basic Info Section */}
                    <div className="space-y-6">
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Datos Personales</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nombres</label>
                          <input
                            {...register("nombres")}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Apellido paterno</label>
                          <input
                            {...register("apellido_paterno")}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Apellido materno</label>
                          <input
                            {...register("apellido_materno")}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Correo electrónico</label>
                          <input
                            type="email"
                            {...register("email")}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">RUT</label>
                          <input
                            {...register("rut")}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Info Section */}
                    <div className="space-y-6">
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Información Adicional</h5>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Sexo</label>
                          <input {...register("sexo")} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Teléfono</label>
                          <input type="tel" {...register("telefono")} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Emergencia</label>
                          <input type="tel" {...register("contacto")} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Ingreso</label>
                          <input type="date" {...register("fecha_ingreso")} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">CIA</label>
                          <input {...register("cia")} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Registro Gral</label>
                          <input {...register("registro")} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Registro CIA</label>
                          <input {...register("registro_cia")} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Código</label>
                          <input {...register("codigo_llamado")} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:!bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* Files Section */}
                    <div className="space-y-6">
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Archivos y Multimedia</h5>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Foto de perfil</label>
                        <div className="flex items-center gap-4 p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] bg-slate-50 dark:!bg-slate-800/50">
                          <Camera className="text-slate-400" size={32} />
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              {...register("imagen")}
                              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-red-600 file:text-white hover:file:bg-red-700 transition-all cursor-pointer"
                            />
                            <p className="mt-2 text-xs text-slate-400 font-bold">Máximo 5MB. Formatos JPG, PNG.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handleToggleEdit}
                        className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
                      >
                        Descartar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || updateProfile.isLoading}
                        className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-xl shadow-red-600/20 flex items-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70"
                      >
                        <Save size={20} />
                        {updateProfile.isLoading ? "Guardando..." : "Guardar Cambios"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BomberoPerfil;
