var Note = new function()
{
    const CONFIRMATION_MOVE_LENGTH = 1.5; //--- How long will camera take to focus on confirmed tile. Use 0 to disable the effect.
    const OUTRO_ZOOM_LENGTH = 5; //--- TIme for camera to zoom out during outro

    var m_Note = document.getElementById("note");
    var m_InDetail = false;
    var m_IsLast = false;

    window.addEventListener(EVENT_GAME_INIT, OnGameInit);
    window.addEventListener(EVENT_TILE_CONFIRMED, OnTileConfirmed);
    window.addEventListener(EVENT_GAME_DRAG_START, OnGameDragStart);

    function OnGameInit()
    {
        SetStyleVariable("--outro-zoom-out", OUTRO_ZOOM_LENGTH + "s");
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
            Camera.SetCamera(posX, posY, 3.5, OUTRO_ZOOM_LENGTH);

            //let tiles = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
            //tiles.classList.add("animateHeartIn");
            let heart = Game.GetSVGDoc().getElementById("heart");
            heart.classList.add("animateHeartIn");

            let outro = document.getElementById("outroBox");
            SetElementVisible(outro, true);
        }
        else
        {
            //--- Default animation
            m_Note.setAttribute("class", "animateNoteIn");
            Camera.SetCamera(posX, parseInt(posY) + 80, 0.5, CONFIRMATION_MOVE_LENGTH); //--- #TODO: Don't hardcode
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
                //let tiles = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
                //tiles.classList.remove("animateHeartIn");
                //tiles.classList.add("animateHeartOut");
                let heart = Game.GetSVGDoc().getElementById("heart");
                heart.classList.remove("animateHeartIn");
                heart.classList.add("animateHeartOut");

                let outro = document.getElementById("outroBox");
                outro.classList.remove("animateOutroIn");
                outro.classList.add("animateOutroOut");
            }
            else
            {
                m_Note.setAttribute("class", "animateNoteOut");

                Tile.RevealNextTile();
            }
        }
    }
}