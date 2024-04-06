var Note = new function()
{
    const NOTE_ZOOM = 0.66;          //--- Note zoom
    const NOTE_OFFSET_Y = -60; //--- Vertical camera offset in zommed-in view

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

                    Camera.SetCamera(posX, parseInt(posY) + NOTE_OFFSET_Y, NOTE_ZOOM, 1.5 - currentTime);
                }
            },
            {
                //--- Write text
                time: 1.75,
                function: function()
                {
                    //--- Show current line
                    Localization.Localize(m_Note, "note_" + ev.detail.tile.id);

                    SetElementVisible(m_Note, true);
                    m_Note.classList.remove("animNoteOut");
                    m_Note.classList.add("animNoteIn");
                    
                    //const tilePair = ev.detail.tile.getAttribute("tilePair");
                    let delay = 0;
                    //if (tilePair != null)
                    //    delay = 1;

                    if (!SKIP_NOTE_ANIM || !Debug.IsDev())
                        AnimateLines(m_Note, 3 - delay, delay);

                    //--- Show paired line
                    //if (tilePair != null)
                    //    Localization.Localize(m_Note, "note_" + tilePair, true);
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
            let duration = 1.5;
            if (SKIP_NOTE_ANIM && Debug.IsDev())
                duration = 1;

            const tile = Tile.RevealNextTile();
            Camera.SetCamera(tile.getAttribute("x"), tile.getAttribute("y"), DEFAULT_ZOOM, duration);
            Camera.EnableManualInput(true);
            
            PlayAudio("audioNoteEnd");
        }
    }
}