/** Dispatch event on click outside of node */
export function clickOutside(node, active) {
  const handleClick = (event) => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      node.dispatchEvent(new CustomEvent("clickOutside", node));
    }
  };

  if (active) document.addEventListener("click", handleClick);

  return {
    destroy() {
      document.removeEventListener("click", handleClick);
    },
    update(active) {
      if (active) document.addEventListener("click", handleClick);
      else document.removeEventListener("click", handleClick);
    },
  };
}
