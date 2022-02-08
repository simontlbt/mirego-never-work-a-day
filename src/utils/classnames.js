export function clsx() {
  let classname = "";

  for (const arg of arguments) {
    if (typeof arg === "string") {
      classname += arg;
      classname += " ";
    } else {
      for (const [key, value] of Object.entries(arg)) {
        if (value) {
          classname += key;
          classname += " ";
        }
      }
    }
  }

  return classname;
}
