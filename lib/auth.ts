/**
 * Telefon raqamni chiroyli ko'rsatish formatiga keltirish (+998 (__) ___-__-__)
 */
export function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  
  let d = digits;
  if (d.startsWith("998")) {
    d = d.substring(3);
  }
  
  const part1 = d.substring(0, 2);
  const part2 = d.substring(2, 5);
  const part3 = d.substring(5, 7);
  const part4 = d.substring(7, 9);

  let formatted = "+998";
  if (part1) formatted += ` (${part1}`;
  if (part1.length === 2) formatted += `)`;
  if (part2) formatted += ` ${part2}`;
  if (part3) formatted += `-${part3}`;
  if (part4) formatted += `-${part4}`;

  return formatted;
}

/**
 * Telefon raqam va parol orqali tizimga kirish
 */
export async function signInWithPhone(phone: string, password: string) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, password }),
    });

    const result = await res.json();

    if (!res.ok || result.error) {
      return { error: new Error(result.error || "Kirishda xatolik yuz berdi") };
    }

    return { data: result.user };
  } catch (err: any) {
    return { error: new Error(err.message || "Tarmoqda xatolik yuz berdi") };
  }
}

/**
 * Tizimdan chiqish
 */
export async function signOutUser() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
  } catch {
    // Ignore error
  }
}

/**
 * Joriy autentifikatsiyadan o'tgan foydalanuvchi profilini olish
 */
export async function getCurrentUserProfile() {
  try {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}
