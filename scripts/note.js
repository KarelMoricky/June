var Note = new function()
{
    const NOTE_ZOOM = 0.66;          //--- Note zoom
    const NOTE_OFFSET_Y = -60; //--- Vertical camera offset in zommed-in view

    const TIME_CAMERA = 0.25;
    const TIME_NOTE = 1;
    const TIME_NOTE_LINES_DEFAULT = [2, 3, 4, 5];
    const TIME_NOTE_LINES = [
        //{id: "tile02", intervals: [2, 3, 4, 5]}, //--- Use default
        {id: "tile03", intervals: [2, 2.7, 4, 4.7]},
        //{id: "tile04", intervals: [2.1, 3.1, 4.1, 5.1]}, //--- Use default
        {id: "tile05", intervals: [2, 2.7, 4, 4.7]},
        {id: "tile06", intervals: [1.7, 2, 3.3, 3.7]},
        {id: "tile07", intervals: [1.7, 2, 3.3, 3.7]},
        {id: "tile08", intervals: [1.7, 2, 3.6, 4]},
        {id: "tile09", intervals: [1.7, 2, 3.6, 4]},
        //{id: "tile10", intervals: [2, 3, 5, 7]}, //--- Use default
        {id: "tile11", intervals: [1, 3, 4.7, 5.7]},
        //{id: "tile12", intervals: [4.1, 4.4, 4.8, 5.1]}, //--- Use default
    ];
    const TIME_END = 7.75;

    const m_Note = document.getElementById("note");
    const m_NoteContinue = document.getElementById("noteContinue");
    var m_InDetail = false;
    let m_CanClose = true;
    let m_IsLast = false;

    window.addEventListener(EVENT_GAME_INIT, OnGameInit);
    window.addEventListener(EVENT_TILE_CONFIRMED, OnTileConfirmed);
    window.addEventListener(EVENT_GAME_DRAG_START, CloseNote);
    m_NoteContinue.addEventListener("click", CloseNote);

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

        //ev.detail.tile.id = "tile04"; //--- Debug skip

        const audio = Sound.Play("music_" + ev.detail.tile.id);
        Sound.Timeline(audio, [
            {
                //--- Zoom camera
                time: TIME_CAMERA,
                function: function(currentTime)
                {
                    let tile = ev.detail.tile;
                    let posX = tile.getAttribute(VAR_TARGET_X);
                    let posY = tile.getAttribute(VAR_TARGET_Y);

                    Camera.SetCamera(posX, parseInt(posY) + NOTE_OFFSET_Y, NOTE_ZOOM, (TIME_NOTE_LINES_DEFAULT[0] - TIME_CAMERA) - currentTime);
                }
            },
            {
                //--- Write text
                time: TIME_NOTE,
                function: function()
                {
                    //--- Show current line
                    Localization.Localize(m_Note, "note_" + ev.detail.tile.id);

                    SetElementVisible(m_Note, true);
                    m_Note.classList.remove("animNoteOut");
                    m_Note.classList.add("animNoteIn");

                    if (!SKIP_NOTE_ANIM || !Debug.IsDev())
                    {
                        //--- Pick intervals tailored for the tile
                        var intervals = TIME_NOTE_LINES_DEFAULT;
                        for (let i = 0; i < TIME_NOTE_LINES.length; i++)
                        {
                            if (TIME_NOTE_LINES[i].id == ev.detail.tile.id)
                            {
                                intervals = TIME_NOTE_LINES[i].intervals;
                                break;
                            }
                        }

                        AnimateLines(m_Note, intervals, TIME_NOTE + 0.1); //--- Add extra offset to compensate for fade-in effect
                    }
                }
            },
            {
                //--- End
                time: TIME_END,
                function: function()
                {
                    AllowClosingNote();
                    SetElementVisible(m_NoteContinue, true);
                }
            }
        ]);


        if (SKIP_NOTE_ANIM && Debug.IsDev())
        {
            //--- Make the animation faster for development
            audio.currentTime = audio.duration - 0.1;
        }
        else
        {
            const forceNoteLoading = NOTE_LOADING && Debug.IsDev();

            //--- Show loading spinner (on iOS the sound can take some time to load, and it can be confusing for the player)
            if (forceNoteLoading)
                audio.muted = true;

            let spinner = Game.GetSVG().getElementById("noteLoading");
            spinner.setAttribute("transform", `translate(${ev.detail.tile.getAttribute("tX")}, ${ev.detail.tile.getAttribute("tY")})`);

            //--- Show the spinner after a brief delay, so it won't pop up when loading time is short
            setTimeout(Show, 500);
            function Show()
            {
                if (spinner)
                    SetElementVisible(spinner, true);
            }

            //--- Wait for the audio to load
            let n = 0;
            setTimeout(Wait, 1);
            function Wait()
            {
                if ((audio.currentTime > 0.1 || audio.muted) && (!forceNoteLoading || n > 400))
                {
                    SetElementVisible(spinner, false);
                    spinner = null;

                    if (forceNoteLoading)
                        audio.muted = false;
                }
                else
                {
                    n++;
                    setTimeout(Wait, 1);
                }

                if (forceNoteLoading)
                    audio.currentTime = 0;
            }
        }

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

        SetElementVisible(m_NoteContinue, false);

        if (m_IsLast)
        {
            Tile.RemoveCurrentTile();
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
            
            Sound.Play("audioNoteEnd");
        }
    }
}