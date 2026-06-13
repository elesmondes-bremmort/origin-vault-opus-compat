const MODULE_ID = "origin-vault-opus-compat";

Hooks.once("ready", () => {
  console.log("Origin Vault - Opus Compat | Ready");

  document.addEventListener("drop", async event => {
    const raw = event.dataTransfer?.getData("application/x-origin-vault-item");
    if (!raw) return;

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    const src = data?.texture?.src || data?.img;
    if (!src || !/\.(png|jpe?g|webp|gif|avif)$/i.test(src)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const point = canvas.activeLayer.getSnappedPoint(
      canvas.canvasCoordinatesFromClient(event),
      { mode: 0 }
    );

    await TileDocument.create({
      x: point.x,
      y: point.y,
      width: 400,
      height: 400,
      texture: { src }
    }, { parent: canvas.scene });

    console.log(`${MODULE_ID} | Origin Vault image dropped as Tile`, src);
  }, true);
});