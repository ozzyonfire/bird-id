interface Payload {
  [key: string]: any;
}

export async function encode(data: Payload) {
  const expiration = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
  const token = new TextEncoder().encode(
    JSON.stringify({
      ...data,
      exp: expiration,
    })
  );
  const passwordUtf8 = new TextEncoder().encode(process.env.JWT_SECRET!);
  const passwordHash = await crypto.subtle.digest("SHA-256", passwordUtf8);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const alg = { name: "AES-GCM", iv };
  const key = await crypto.subtle.importKey("raw", passwordHash, alg, false, [
    "encrypt",
  ]);

  const encryptedToken = await crypto.subtle.encrypt(alg, key, token);
  const tokenString = btoa(
    String.fromCharCode(...Array.from(new Uint8Array(encryptedToken)))
  );
  const ivString = btoa(String.fromCharCode(...Array.from(iv)));

  return { token: tokenString, iv: ivString, expiration };
}

export async function decode<Payload>(token: string, iv: string) {
  const encryptedToken = Uint8Array.from(atob(token), (c) => c.charCodeAt(0));
  const ivArray = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

  const passwordUtf8 = new TextEncoder().encode(process.env.JWT_SECRET!);
  const passwordHash = await crypto.subtle.digest("SHA-256", passwordUtf8);

  const alg = { name: "AES-GCM", iv: ivArray };
  const key = await crypto.subtle.importKey("raw", passwordHash, alg, false, [
    "decrypt",
  ]);

  const decryptedToken = await crypto.subtle.decrypt(alg, key, encryptedToken);
  return JSON.parse(new TextDecoder().decode(decryptedToken)) as Payload & {
    exp: number;
  };
}
