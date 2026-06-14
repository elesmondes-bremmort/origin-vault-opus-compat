(() => {
  const MODULE_ID = "origin-vault-opus-compat";

  Hooks.once("ready", () => {
    console.log(`${MODULE_ID} | Ready`);

    document.addEventListener("dragover", event => {
      if (!shouldHandleDrop(event)) return;
      event.preventDefault();
    }, true);

    document.addEventListener("drop", async event => {
      if (!canvas?.ready || !canvas.scene) return;
      if (!shouldHandleDrop(event)) return;

      const data = getOriginVaultDropData(event);
      if (!data) return;

      const src = data?.texture?.src || data?.img;
      if (!src || !isImagePath(src)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const point = canvas.canvasCoordinatesFromClient(event);

      const dimensions = await getImageDimensions(src);
      const maxSize = 400;

      const scale = Math.min(
        maxSize / dimensions.width,
        maxSize / dimensions.height,
        1
      );

      const width = Math.round(dimensions.width * scale);
      const height = Math.round(dimensions.height * scale);

      await TileDocument.create({
        x: point.x,
        y: point.y,
        width,
        height,
        texture: { src }
      }, { parent: canvas.scene });

            console.log(`${MODULE_ID} | Origin Vault image dropped as Tile`, src);
          }, true);
  });

  function shouldHandleDrop(event) {
    if (!isOriginVaultImageDrop(event)) return false;
    if (!isOverCanvas(event)) return false;

    const data = getOriginVaultDropData(event);
    if (!data) return false;

    const src = data?.texture?.src || data?.img;
    return Boolean(src && isImagePath(src));
  }

  function isOverCanvas(event) {
    const board = document.getElementById("board");
    if (!board) return false;

    const rect = board.getBoundingClientRect();

    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }

  function isOriginVaultImageDrop(event) {
    const types = Array.from(event.dataTransfer?.types ?? []);
    return types.includes("application/x-origin-vault-item");
  }

  function getOriginVaultDropData(event) {
    const raw = event.dataTransfer?.getData("application/x-origin-vault-item");
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn(`${MODULE_ID} | Invalid Origin Vault drop data`, error);
      return null;
    }
  }

  function isImagePath(src) {
    return /\.(png|jpe?g|webp|gif|avif)$/i.test(src);
  }

  function getImageDimensions(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = reject;
    img.src = src;
  });
}
})();