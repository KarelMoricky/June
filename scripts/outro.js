var Outro = new function()
{
    const OUTRO_MOVE_DELAY = 0.25; //--- How long before camera animation starts
    const OUTRO_ZOOM_LENGTH = 5; //--- Time for camera to zoom out during outro
    const OUTRO_ZOOM_VALUE = 3; //--- Camera zoom factor

    let m_CanClose = false;

    window.addEventListener(EVENT_GAME_INIT, (ev) =>
    {
        SetStyleVariable("--outro-zoom-out", OUTRO_ZOOM_LENGTH + "s");
    });

    window.addEventListener(EVENT_TILE_CONFIRMED, (ev) =>
    {
        if (!ev.detail.isManual || !ev.detail.isLast)
            return;
        
        Camera.EnableManualInput(false);
        Camera.SetCamera(0, 0, OUTRO_ZOOM_VALUE, OUTRO_ZOOM_LENGTH, OUTRO_MOVE_DELAY);

        let tiles = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
        tiles.classList.add("animTilesOut");

        let grid = Game.GetSVGDoc().getElementById("grid");
        grid.classList.add("animGridOut");

        let heart = Game.GetSVGDoc().getElementById("heart");
        SetElementVisible(heart, true);

        let outro = document.getElementById("outroBox");
        SetElementVisible(outro, true);

        m_CanClose = false;
        new Promise((resolve) => setTimeout(resolve, 10000)).then(() => {
            m_CanClose = true;
        });
    });

    window.addEventListener(EVENT_GAME_DRAG_START, (ev) =>
    {
        if (!m_CanClose || Camera.IsAnimPlaying())
            return;

        Camera.EnableManualInput(true);
        Camera.SetCamera(-1, -1, 1, 0.5);
        
        let tiles = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
        tiles.classList.remove("animTilesOut");
        tiles.classList.add("animTilesIn");

        let grid = Game.GetSVGDoc().getElementById("grid");
        grid.classList.remove("animTilesOut");
        grid.classList.add("animTilesIn");
        
        let heart = Game.GetSVGDoc().getElementById("heart");
        heart.classList.remove("animHeartIn");
        heart.classList.add("animHeartOut");

        let outro = document.getElementById("outroBox");
        outro.classList.remove("animOutroIn");
        outro.classList.add("animOutroOut");

        let thanks = document.getElementById("thanks");
        SetElementVisible(thanks, true);

        Game.SetFinished();
    });
}