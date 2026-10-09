export type Details = {
  storeName: string; businessType: string; email: string; phone: string;
  address: string; city: string; pincode: string; logo: File | null;
};
export type Errors = Partial<Record<keyof Details, string>>;

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export function validateDetails(d: Details): Errors {
  const e: Errors = {};
  if (d.storeName.trim().length < 3) e.storeName = "Store name must be at least 3 characters";
  if (!slugify(d.storeName)) e.storeName = "Use letters or numbers in the name";
  if (!d.businessType) e.businessType = "Choose a business type";
  if (!/^\S+@\S+\.\S+$/.test(d.email)) e.email = "Enter a valid email";
  if (!/^[6-9]\d{9}$/.test(d.phone)) e.phone = "Enter a valid 10-digit Indian mobile number";
  if (d.address.trim().length < 5) e.address = "Enter the store address";
  if (d.city.trim().length < 2) e.city = "Enter the city";
  if (!/^\d{6}$/.test(d.pincode)) e.pincode = "Pincode must be 6 digits";
  if (d.logo) {
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(d.logo.type)) e.logo = "Logo must be PNG, JPG, WebP or SVG";
    else if (d.logo.size > 2 * 1024 * 1024) e.logo = "Logo must be under 2 MB";
  }
  return e;
}
