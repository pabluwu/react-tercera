const normalizeName = (value) =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : null;

const extractGroupNames = (source) => {
  if (!source) return [];
  if (Array.isArray(source)) {
    return source
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item.name === "string") return item.name;
        if (item && typeof item.nombre === "string") return item.nombre;
        return null;
      })
      .filter(Boolean);
  }
  if (typeof source === "string") return [source];
  if (source && typeof source === "object") {
    if (typeof source.name === "string") return [source.name];
    if (typeof source.nombre === "string") return [source.nombre];
  }
  return [];
};

export const getUserGroupNames = (user) => {
  if (!user) return [];

  const candidates = [
    user.groups,
    user.grupos,
    user.group,
    user.perfil?.grupos,
    user.perfil?.groups,
    user.perfil?.group,
  ];

  return candidates
    .flatMap((entry) => extractGroupNames(entry))
    .map((name) => normalizeName(name))
    .filter(Boolean);
};

export const isTesorero = (user) => {
  const groupNames = getUserGroupNames(user).map((g) => g.toLowerCase());
  const groupMatch = groupNames.includes("tesorero");

  const permissionMatch = Array.isArray(user?.permissions)
    ? user.permissions.includes("bomberos.add_comprobantetesorero")
    : false;

  return groupMatch || permissionMatch;
};

export const isAyudanteOrSecretario = (user) => {
  const groupNames = getUserGroupNames(user).map((g) => g.toLowerCase());
  return groupNames.includes("ayudante") || groupNames.includes("secretario");
};

export const isOficial = (user) => {
  const groupNames = getUserGroupNames(user).map((g) => g.toLowerCase());
  const oficiales = [
    "ayudante",
    "capitan",
    "director",
    "intendente",
    "secretario",
    "teniente primero",
    "teniente segundo",
    "teniente tercero",
    "tesorero",
  ];

  return oficiales.some((name) => groupNames.includes(name));
};

export const canSeeLicencias = (user) => {
  const groupNames = getUserGroupNames(user).map((g) => g.toLowerCase());
  const oficiales = [
    "ayudante",
    "capitan",
    "secretario",
    "director"
  ]
  return oficiales.some((name) => groupNames.includes(name));
}
