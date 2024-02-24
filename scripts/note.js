var Note = new function()
{
    const CONFIRMATION_MOVE_DELAY = 0.25; //--- How long before camera animation starts
    const CONFIRMATION_MOVE_LENGTH = 1.5; //--- How long will camera take to focus on confirmed tile. Use 0 to disable the effect.
    
    const NOTE_ZOOM_VALUE = 0.5; //--- Camera zoom factor

    const m_Note = document.getElementById("note");
    var m_InDetail = false;
    let m_CanClose = true;
    let m_IsLast = false;

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
        if (!ev.detail.isManual)// || ev.detail.isLast)
            return;

        m_InDetail = true;
        m_IsLast = ev.detail.isLast;

        Camera.EnableManualInput(false);

        ProcessAudio(PlayAudio("audioNoteStart"), [
            //--- Animation started
            {
                time: 0,
                function: function()
                {
                    let tile = ev.detail.tile;
                    let posX = tile.getAttribute(VAR_TARGET_X);
                    let posY = tile.getAttribute(VAR_TARGET_Y);

                    Camera.SetCamera(posX, parseInt(posY) - 20, NOTE_ZOOM_VALUE, CONFIRMATION_MOVE_LENGTH, CONFIRMATION_MOVE_DELAY);
            
                    Localization.Localize(m_Note, "note_" + tile.id);
                }
            },
            //--- Write text
            {
                time: 1.75,
                function: function()
                {
                    SetElementVisible(m_Note, true);
                    m_Note.classList.remove("animNoteOut");
                    m_Note.classList.add("animNoteIn");

                    let segments = AnimateWords(m_Note);
                    segments[segments.length - 1].addEventListener("animationend", AllowClosingNote);
                }
            }
        ]);

        Game.SetState(GAME_STATE_DISABLED);
        if (Debug.IsDev())
            AllowClosingNote();
        else
            m_CanClose = false;
    }

    function AllowClosingNote()
    {
        m_CanClose = true;
        Game.SetState(GAME_STATE_DEFAULT);
    }

    function CloseNote()
    {
        if (!m_InDetail || !m_CanClose || Camera.IsAnimPlaying())
            return;

        m_InDetail = false;

        m_Note.classList.remove("animNoteIn");
        m_Note.classList.add("animNoteOut");

        if (m_IsLast)
        {
            const ev = new CustomEvent(EVENT_OUTRO);
            window.dispatchEvent(ev);
        }
        else
        {
            Camera.EnableManualInput(true);
            Camera.SetCamera(-1, -1, 1, 0.5);
            Tile.RevealNextTile();

            PlayAudio("audioNoteEnd");
        }
    }
}