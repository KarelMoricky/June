var Note = new function()
{
    var m_Note = document.getElementById("note");
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

        let posX = tile.getAttribute(VAR_TARGET_X);
        let posY = tile.getAttribute(VAR_TARGET_Y);

        m_InDetail = true;
        m_IsLast = ev.detail.isLast;

        if (ev.detail.isLast)
        {
            //--- Last animation
            Camera.SetCamera(posX, posY, 3.5, CONFIRMATION_MOVE_DURATION * 3);

            let tiles = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
            tiles.classList.add("animateHeartIn");

            let outro = document.getElementById("outroBox");
            outro.classList.add("animateOutroIn");
            console.log(outro);
        }
        else
        {
            //--- Default animation
            m_Note.setAttribute("class", "animateNoteIn");
            Camera.SetCamera(posX, parseInt(posY) + 80, 0.5, CONFIRMATION_MOVE_DURATION); //--- #TODO: Don't hardcode
        }
    }

    function OnGameDragStart()
    {
        if (m_InDetail && !Camera.IsAnimPlaying())
        {

            m_InDetail = false;

            Camera.SetCamera(-1, -1, 1, 0.25);

            //--- Reset the last animation
            if (m_IsLast)
            {
                let tiles = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
                tiles.classList.remove("animateHeartIn");
                tiles.classList.add("animateHeartOut");

                let outro = document.getElementById("outroBox");
                outro.classList.add("animateOutroOut");
            }
            else
            {
                m_Note.setAttribute("class", "animateNoteOut");
            }
        }
    }
}