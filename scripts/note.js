var Note = new function()
{
    const CONFIRMATION_MOVE_DELAY = 0.25; //--- How long before camera animation starts
    const CONFIRMATION_MOVE_LENGTH = 1.5; //--- How long will camera take to focus on confirmed tile. Use 0 to disable the effect.
    
    const NOTE_ZOOM_VALUE = 0.5; //--- Camera zoom factor

    var m_Note;
    var m_InDetail = false;
    let m_CanClose = true;

    window.addEventListener(EVENT_GAME_INIT, OnGameInit);
    window.addEventListener(EVENT_TILE_CONFIRMED, OnTileConfirmed);
    window.addEventListener(EVENT_GAME_DRAG_START, CloseNote);

    function OnGameInit()
    {
        Game.GetSVG().addEventListener("keydown", (ev) => {
            if (ev.key == "Escape")
                CloseNote()
        });
    }

    function OnTileConfirmed(ev)
    {
        if (!ev.detail.isManual || ev.detail.isLast)
            return;

        let tile = ev.detail.tile;

        let posX = tile.getAttribute(VAR_TARGET_X);
        let posY = tile.getAttribute(VAR_TARGET_Y);

        m_InDetail = true;

        Camera.EnableManualInput(false);
        Camera.SetCamera(posX, parseInt(posY) - 20, NOTE_ZOOM_VALUE, CONFIRMATION_MOVE_LENGTH, CONFIRMATION_MOVE_DELAY); //--- #TODO: Don't hardcode

        m_Note = document.getElementById("note");
        Localization.Localize(m_Note, "note_" + tile.id);
        SetElementVisible(m_Note, true);
        m_Note.classList.remove("animNoteOut");
        m_Note.classList.add("animNoteIn");

        AnimateText(m_Note);
    }

    function CloseNote()
    {
        if (!m_InDetail || !m_CanClose || Camera.IsAnimPlaying())
            return;

        m_InDetail = false;
        Camera.EnableManualInput(true);
        Camera.SetCamera(-1, -1, 1, 0.5);

        m_Note.classList.remove("animNoteIn");
        m_Note.classList.add("animNoteOut");
        m_Note = null;

        Tile.RevealNextTile();
    }

    function AnimateText(element)
    {
        const segments = element.innerHTML.split(" ");
        let segment = null;
        element.innerHTML = "";
        for (let i = 0; i < segments.length; i++)
        {
            segment = CreateElement("span", element, [["class", "animatedText"], ["style", `animation-delay: ${2.1 + 0.1 * i}s`]]); //--- #TODO: Delay as param
            segment.innerHTML = segments[i] + "&nbsp;";
        }

        if (!Debug.IsDev())
        {
            m_CanClose = false;
            segment.addEventListener("animationend", (event) =>
            {
                m_CanClose = true;
            });
        }
    }
}