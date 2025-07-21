export const loginUser = async ({ username, password }) => {
    const res = await fetch('http://127.0.0.1:8000/api/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
  
    console.log(res);
    if (!res.ok) {
      throw new Error('Credenciales inválidas');
    }
  
    const data = await res.json(); // contiene { access, refresh }
    return data;
  };