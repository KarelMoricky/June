var Note = new function()
{
    var m_Note = null;

    window.addEventListener(EVENT_GAME_INIT, OnGameInit);
    window.addEventListener(EVENT_TILE_CONFIRMED, OnTileConfirmed);
    window.addEventListener(EVENT_GAME_DRAG_START, OnGameDragStart);

    function OnGameInit()
    {
    }

    function OnTileConfirmed(ev)
    {
        if (!ev.detail["isManual"])
            return;

        let tile = ev.detail["tile"];

        if (!m_Note)
            m_Note = Game.GetSVGDoc().getElementById("note");

        let posX = tile.getAttribute("x");
        let posY = tile.getAttribute("y");

        m_Note.setAttribute("class", "animateFadeIn");
        m_Note.setAttribute("x", posX);
        m_Note.setAttribute("y", posY);

        if (CONFIRMATION_MOVE_DURATION > 0)
            Camera.MoveCameraGame(posX, posY, CONFIRMATION_MOVE_DURATION);
    }

    function OnGameDragStart()
    {
        if (m_Note && Tile.GetSelected())
            m_Note.setAttribute("class", "animateFadeOut");
    }
}