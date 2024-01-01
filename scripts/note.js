var Note = new function()
{
    var m_Note = null;
    var m_Note2 = document.getElementById("note2");

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

        let posX = tile.getAttribute(VAR_TARGET_X);
        let posY = tile.getAttribute(VAR_TARGET_Y);

        // m_Note.setAttribute("class", "animateFadeIn");
        // m_Note.setAttribute("x", posX);
        // m_Note.setAttribute("y", posY);

        m_Note2.setAttribute("class", "animateFadeIn");

        if (CONFIRMATION_MOVE_DURATION > 0)
        {
            Camera.SetCamera(posX, posY, 0.5, CONFIRMATION_MOVE_DURATION);
        }
    }

    function OnGameDragStart()
    {
        if (!m_Note2.classList.contains("hidden"))
            m_Note2.setAttribute("class", "animateFadeOut");

        //if (m_Note && Tile.GetSelected())
        //    m_Note.setAttribute("class", "animateFadeOut");

        if (CONFIRMATION_MOVE_DURATION > 0)
        {
            Camera.SetCamera(-1, -1, 1);
        }
    }
}