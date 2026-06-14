(() => {
  const MODULE_ID = "origin-vault-opus-compat";

  Hooks.once("ready", () => {
    console.log(`${MODULE_ID} | Ready`);

    const canvasElement = document.getElementById("board");
    if (!canvasElement) {
      console.warn(`${MODULE_ID} | Canvas board not found`);
      return;
    }

    canvasElement.addEventListener("dragover", event => {
      if (!isOriginVaultImageDrop(event)) return;
      event.preventDefault();
    });

    canvasElement.addEventListener("drop", async event => {
      if (!canvas?.ready || !canvas.scene) return;
      if (!isOriginVaultImageDrop(event)) return;

      const data = getOriginVaultDropData(event);
      if (!data) return;

      const src = data?.texture?.src || data?.img;
      if (!src || !isImagePath(src)) return;

      event.preventDefault();
      event.stopPropagation();

      const point = canvas.canvasCoordinatesFromClient(event);

      await TileDocument.create({
        x: point.x,
        y: point.y,
        width: 400,
        height: 400,
        texture: { src }
      }, { parent: canvas.scene });

      console.log(`${MODULE_ID} | Origin Vault image dropped as Tile`, src);
    });
  });

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
})();