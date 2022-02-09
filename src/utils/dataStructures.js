export function Some(value) {
  return { hasValue: true, value };
}

export function None() {
  return { hasValue: false };
}
