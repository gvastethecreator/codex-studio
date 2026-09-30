/** Enter confirms an IME composition before it is a real key. Do not commit then. */
export function commitsOnEnter(event) {
  if (!event || event.isComposing || event.keyCode === 229) return false;
  return event.key === "Enter";
}
