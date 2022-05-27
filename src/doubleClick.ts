let clicks = 0;
let clickTimer;

export function doubleClick(node: HTMLElement) {
  function handleClick(e: MouseEvent) {
    if (node !== e.target) return;

    clicks += 1;

    node.dispatchEvent(
      new CustomEvent("singleClick", {
        detail: e,
      })
    );

    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => (clicks = 0), 200);

    if (clicks === 2) {
      node.dispatchEvent(new CustomEvent("doubleClick"));
      clearTimeout(clickTimer);
      clicks = 0;
    }
  }

  node.addEventListener("click", handleClick, true);

  return {
    destroy() {
      node.removeEventListener("click", handleClick, true);
    },
  };
}
