export const loginUser = async ({ rut, password }) => {
    const res = await fetch('http://127.0.0.1:8000/api/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rut, password }),
    });
  
    if (!res.ok) {
      throw new Error('Credenciales inválidas');
    }
  
    const data = await res.json(); // contiene { access, refresh }
    return data;
  };

export const requestPasswordReset = async ({ rut }) => {
  const res = await fetch('http://127.0.0.1:8000/api/password-reset/request/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rut: rut || '' }),
  });

  if (!res.ok) {
    const message = await extractErrorMessage(res);
    throw new Error(message || 'No se pudo solicitar el restablecimiento.');
  }

  return true;
};

export const confirmPasswordReset = async ({ uid, token, new_password, new_password_confirm }) => {
  const res = await fetch('http://127.0.0.1:8000/api/password-reset/confirm/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid, token, new_password, new_password_confirm }),
  });

  if (!res.ok) {
    const message = await extractErrorMessage(res);
    throw new Error(message || 'No se pudo actualizar la contraseña.');
  }

  return true;
};

const extractErrorMessage = async (res) => {
  try {
    const data = await res.json();
    if (data?.detail) return data.detail;
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) return data.join(', ');
    const firstKey = data && typeof data === 'object' ? Object.keys(data)[0] : null;
    if (firstKey && Array.isArray(data[firstKey])) return data[firstKey].join(', ');
    if (firstKey && typeof data[firstKey] === 'string') return data[firstKey];
  } catch {
    // ignore parse error
  }
  try {
    return await res.text();
  } catch {
    return null;
  }
};
