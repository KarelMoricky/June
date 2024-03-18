var Note = new function()
{
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

        const audio = PlayAudio("audioNoteStart")
        ProcessAudio(audio, [
            {
                //--- Zoom camera
                time: 0.25,
                function: function(currentTime)
                {
                    let tile = ev.detail.tile;
                    let posX = tile.getAttribute(VAR_TARGET_X);
                    let posY = tile.getAttribute(VAR_TARGET_Y);

                    Camera.SetCamera(posX, parseInt(posY) - 20, NOTE_ZOOM_VALUE, 1.5 - currentTime);
                }
            },
            {
                //--- Write text
                time: 1.75,
                function: function()
                {
                    Localization.Localize(m_Note, "note_" + ev.detail.tile.id);
                    SetElementVisible(m_Note, true);
                    m_Note.classList.remove("animNoteOut");
                    m_Note.classList.add("animNoteIn");

                    if (!SKIP_NOTE_ANIM || !Debug.IsDev())
                        AnimateWords(m_Note);
                }
            },
            {
                //--- End
                time: 4.75,
                function: function()
                {
                    AllowClosingNote();
                }
            }
        ]);

        if (SKIP_NOTE_ANIM && Debug.IsDev())
            audio.currentTime = audio.duration - 0.1;

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