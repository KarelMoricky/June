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

        m_Note.setAttribute("class", "");
        m_Note.setAttribute("x", tile.getAttribute("x"));
        m_Note.setAttribute("y", tile.getAttribute("y"));
    }

    function OnGameDragStart()
    {
        if (m_Note && Tile.GetSelected())
            m_Note.setAttribute("class", "hidden");
    }
}