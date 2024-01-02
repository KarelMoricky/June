var Note = new function()
{
    var m_Note = null;
    var m_Note2 = document.getElementById("note2");
    var m_InDetail = false;
    var m_IsLast = false;

    window.addEventListener(EVENT_GAME_INIT, OnGameInit);
    window.addEventListener(EVENT_TILE_CONFIRMED, OnTileConfirmed);
    window.addEventListener(EVENT_GAME_DRAG_START, OnGameDragStart);

    function OnGameInit()
    {
    }

    function OnTileConfirmed(ev)
    {
        if (!ev.detail.isManual)
            return;

        let tile = ev.detail.tile;

        if (!m_Note)
            m_Note = Game.GetSVGDoc().getElementById("note");

        let posX = tile.getAttribute(VAR_TARGET_X);
        let posY = tile.getAttribute(VAR_TARGET_Y);

        // m_Note.setAttribute("class", "animateFadeIn");
        // m_Note.setAttribute("x", posX);
        // m_Note.setAttribute("y", posY);

        m_InDetail = true;
        m_IsLast = ev.detail.isLast;

        if (ev.detail.isLast)
        {
            //--- Last animation
            Camera.SetCamera(posX, posY, 3.5, CONFIRMATION_MOVE_DURATION * 3);

            let tiles = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
            tiles.classList.add("animateHeartIn");

            let outro = Game.GetSVGDoc().getElementById("outro");
            outro.classList.add("animateOutroIn");
        }
        else
        {
            //--- Default animation
            m_Note2.setAttribute("class", "animateFadeIn");
            Camera.SetCamera(posX, parseInt(posY) + 80, 0.5, CONFIRMATION_MOVE_DURATION); //--- #TODO: Don't hardcode
        }
    }

    function OnGameDragStart()
    {
        if (m_InDetail && !Camera.IsAnimPlaying())
        {
            m_Note2.setAttribute("class", "animateFadeOut");

            //if (m_Note && Tile.GetSelected())
            //    m_Note.setAttribute("class", "animateFadeOut");

            m_InDetail = false;

            Camera.SetCamera(-1, -1, 1, 0.25);

            //--- Reset the last animation
            if (m_IsLast)
            {
                let tiles = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
                tiles.classList.remove("animateHeartIn");
                tiles.classList.add("animateHeartOut");

                let outro = Game.GetSVGDoc().getElementById("outro");
                outro.classList.add("animateOutroOut");
            }
        }
    }
}