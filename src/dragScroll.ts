export function dragScroll(node, scrollableNode) {
  let movingX;
  let movingY;

  const onMouseMove = (e) => {
    if (e.which === 2) {
      node.dispatchEvent(new CustomEvent("dragStart"));

      if (movingX) {
        scrollableNode.scrollBy({
          left: -(e.screenX - movingX),
          top: -(e.screenY - movingY),
        });
      }

      movingX = e.screenX;
      movingY = e.screenY;
    } else {
      movingX = 0;
      movingY = 0;

      node.dispatchEvent(new CustomEvent("dragEnd"));
    }
  };

  node.addEventListener("mousemove", onMouseMove);

  return {
    destroy() {
      node.removeEventListener("mousemove", onMouseMove);
    },
  };
}
