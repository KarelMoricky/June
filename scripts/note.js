var Note = new function()
{
    const CONFIRMATION_MOVE_DELAY = 0.25; //--- How long before camera animation starts
    const CONFIRMATION_MOVE_LENGTH = 1.5; //--- How long will camera take to focus on confirmed tile. Use 0 to disable the effect.
    
    const OUTRO_ZOOM_LENGTH = 5; //--- Time for camera to zoom out during outro
    const OUTRO_ZOOM_VALUE = 3; //--- Camera zoom factor

    var m_Note;
    var m_InDetail = false;
    var m_IsLast = false;

    window.addEventListener(EVENT_GAME_INIT, OnGameInit);
    window.addEventListener(EVENT_TILE_CONFIRMED, OnTileConfirmed);
    window.addEventListener(EVENT_GAME_DRAG_START, CloseNote);

    function OnGameInit()
    {
        SetStyleVariable("--outro-zoom-out", OUTRO_ZOOM_LENGTH + "s");
        
        Game.GetSVG().addEventListener("keydown", (ev) => {
            if (ev.key == "Escape")
                CloseNote()
        });
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
            Camera.SetCamera(posX, posY, OUTRO_ZOOM_VALUE, OUTRO_ZOOM_LENGTH, CONFIRMATION_MOVE_DELAY);

            let tiles = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
            tiles.classList.add("animTilesOut");

            let grid = Game.GetSVGDoc().getElementById("grid");
            grid.classList.add("animGridOut");

            let heart = Game.GetSVGDoc().getElementById("heart");
            SetElementVisible(heart, true);

            let outro = document.getElementById("outroBox");
            SetElementVisible(outro, true);
        }
        else
        {
            //--- Default animation
            Camera.SetCamera(posX, parseInt(posY) - 20, 0.5, CONFIRMATION_MOVE_LENGTH, CONFIRMATION_MOVE_DELAY); //--- #TODO: Don't hardcode

            m_Note = document.getElementById("note");
            Localization.Localize(m_Note, "note_" + tile.id);
            SetElementVisible(m_Note, true);
            m_Note.classList.remove("animNoteOut");
            m_Note.classList.add("animNoteIn");

            AnimateText(m_Note);
        }
    }

    function CloseNote()
    {
        if (m_InDetail && !Camera.IsAnimPlaying())
        {
            m_InDetail = false;

            Camera.SetCamera(-1, -1, 1, 0.5);

            //--- Reset the last animation
            if (m_IsLast)
            {
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
            }
            else
            {
                m_Note.classList.remove("animNoteIn");
                m_Note.classList.add("animNoteOut");
                m_Note = null;

                Tile.RevealNextTile();
            }
        }
    }

    function AnimateText(element)
    {
        const segments = element.innerHTML.split(" ");
        element.innerHTML = "";
        for (let i = 0; i < segments.length; i++)
        {
            const segment = CreateElement("span", element, [["class", "animatedText"], ["style", `animation-delay: ${2.1 + 0.1 * i}s`]]); //--- #TODO: Delay as param
            segment.innerHTML = segments[i] + "&nbsp;";
        }
    }
}