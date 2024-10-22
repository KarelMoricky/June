var Outro = new function()
{
    const INERTIA_DEFAULT = 0.02;
    
    const OUTRO_MOVE_DELAY = 0.25; //--- How long before camera animation starts
    const OUTRO_ZOOM_VALUE = 4.5; //--- Camera zoom in outro
    const CREDITS_ZOOM_VALUE = 0.66; //--- Camera zoom at the end of the game

    const TIME_START_CAMERA = 0;
    const TIME_START_EDIT = 4.7;
    const TIME_START_HINT = 5.7;

    const TIME_NAME_HEART = 0;
    const TIME_NAME_NOTE_LINES = [3.15, 5.1, 7.1];
    const TIME_NAME_LETTER_1 = 9.3;
    const TIME_NAME_LETTER_2 = 11.1;
    const TIME_NAME_LETTER_3 = 13.0;
    const TIME_NAME_LETTER_4 = 13.7;
    const TIME_NAME_NOTE_OUT = 16.8;
    const TIME_NAME_CONSTELLATION = 33.5;
    const TIME_NAME_END = 41;

    let m_CanClose = false;
    let m_Tiles = null;
    let m_TileComposition = null;
    let m_Heart = null;
    let m_HeartHint = null;
    let m_Drag = {x: 0, y: 0, isActive: false};
    let m_TargetPos = {x: 0, y: 0};
    let m_FinalPos = {x: 0, y: 0};
    let m_TimePrev = 0;
    let m_Snapped = false;
    let m_NameLetters = [];

    //--- Animation when outro begins
    const m_TimelineOutroStart = [
        {
            //--- Animation started
            time: TIME_START_CAMERA,
            function: function(currentTime)
            {
                Camera.SetCamera(m_FinalPos.x, m_FinalPos.y, OUTRO_ZOOM_VALUE, 5 - currentTime, OUTRO_MOVE_DELAY);

                const grid = Game.GetSVGDoc().getElementById("grid");
                grid.classList.add("animGridOut");
            }
        },
        {
            //--- Make tiles editable
            time: TIME_START_EDIT,
            function: function()
            {
                SetElementVisible(m_Heart, true);
                m_Tiles.classList.add("animTilesCurrent");
                EnableControlTiles();
   
                window.addEventListener(EVENT_GAME_DRAG_START, OnGameDragStart);
                window.addEventListener(EVENT_GAME_DRAG, OnGameDrag);
                window.addEventListener(EVENT_GAME_DRAG_END, OnGameDragEnd);
                
                requestAnimationFrame(OnEachFrame);
            }
        },
        {
            //--- Show hint
            time: TIME_START_HINT,
            function: function()
            {
                SetElementVisible(m_HeartHint, true);
            }
        }
    ];

    //--- Animation when the player places the heart and the name is revealed
    const m_TimelineOutroName = [
        {
            //--- Heart
            time: TIME_NAME_HEART,
            function: function()
            {
                m_Heart.classList.add("animHeartIn");
                m_Heart.classList.add("ignoreCursor");
                m_Heart.classList.remove("heartDraggable");
    
                m_HeartHint.classList.remove("animHeartHintIn");
                m_HeartHint.classList.add("animHeartHintOut");
    
                m_Tiles.classList.add("animTilesOut");
                m_TileComposition.classList.add("animTilesSettle");
    
                SetElementVisible(Game.GetSVGDoc().getElementById("heartHighlight1"), true);
                SetElementVisible(Game.GetSVGDoc().getElementById("heartHighlight2"), true);
                SetElementVisible(Game.GetSVGDoc().getElementById("heartHighlight3"), true);
                Game.GetSVGDoc().getElementById("heartPolygon").classList.add("animHeartBeat");
            }
        },
        {
            //--- Handwriting
            time: TIME_NAME_NOTE_LINES[0],
            function: function()
            {
                const outroNote = document.getElementById("outroNote");
                SetElementVisible(outroNote, true);

                AnimateLines(outroNote, TIME_NAME_NOTE_LINES, TIME_NAME_NOTE_LINES[0]);
            }
        },
        {
            //--- Letter 1
            time: TIME_NAME_LETTER_1,
            function: function()
            {
                const outroName = document.getElementById("outroName");
                SetElementVisible(outroName, true);

                const text = outroName.innerHTML;
                outroName.innerHTML = "";
                
                let segment = null;
                for (let i = 0; i < text.length; i++)
                {
                    segment = CreateElement("span", outroName);
                    segment.innerHTML = text[i];
                    segment.classList.add("outroNameLetter");
                    m_NameLetters.push(segment);
                }

                ShowLetter(0);
            }
        },
        {
            //--- Letter 2
            time: TIME_NAME_LETTER_2,
            function: function() {ShowLetter(1);}
        },
        {
            //--- Letter 3
            time: TIME_NAME_LETTER_3,
            function: function() {ShowLetter(2);}
        },
        {
            //--- Letter 4
            time: TIME_NAME_LETTER_4,
            function: function() {ShowLetter(3);}
        },
        {
            //--- Zoom in
            time: TIME_NAME_NOTE_OUT,
            function: function()
            {
                outroNote.classList.add("animOutroNoteOut");

                const cameraDuration = TIME_NAME_CONSTELLATION - TIME_NAME_NOTE_OUT;
                Camera.SetCamera(0, 0, OUTRO_ZOOM_VALUE, 0);
                Camera.SetCamera(0, 12, 1, cameraDuration); //--- Offset down to show the constellation

                m_Tiles.classList.remove("animTilesOut");
                m_Tiles.classList.add("animTilesIn");

                m_Heart.classList.remove("animHeartIn");
                m_Heart.classList.add("animHeartOut");

                m_TimePrev = -1;
                m_TargetPos.x = 0;
                m_TargetPos.y = 0;

                const tiles = Tile.GetTiles();
                for (let i = 0; i < tiles.length; i++)
                {
                    if (i != 1)
                        tiles[i].classList.add("animOutroTileOut");
                }
            }
        },
        {
            //--- Constellation
            time: TIME_NAME_CONSTELLATION,
            function: function()
            {
                const object = document.getElementById("constellationObject");
                const constellationSvg = object.contentDocument.firstElementChild;
                SetElementVisible(constellationSvg.getElementById("constLines"), true, true);
                SetElementVisible(constellationSvg.getElementById("constStarHighlights"), true, true);
            }
            //--- Timing in constellation.css
        },
        {
            //--- End
            time: TIME_NAME_END,
            function: function()
            {
                m_CanClose = true;
                Game.SetState(GAME_STATE_DEFAULT);

                const outroContinue = document.getElementById("outroContinue");
                SetElementVisible(outroContinue, true);
                outroContinue.addEventListener("click", CloseOutro);
            }
        }
    ];

    window.addEventListener(EVENT_GAME_INIT, (ev) =>
    {
        m_Tiles = Game.GetSVGDoc().getElementById("tiles");
        m_TileComposition = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
        m_Heart = Game.GetSVGDoc().getElementById("heart");
        m_HeartHint = Game.GetSVGDoc().getElementById("heartHint");

        m_FinalPos.x = parseInt(m_HeartHint.getAttribute("x"));
        m_FinalPos.y = parseInt(m_HeartHint.getAttribute("y"));

        var hintTransform = new DOMMatrix(ISO_MATRIX);
        hintTransform.f = m_HeartHint.getAttribute("y");
        m_HeartHint.setAttribute("transform", hintTransform);
    });

    window.addEventListener(EVENT_OUTRO, (ev) =>
    {
        //--- Reveal
        Camera.EnableManualInput(false);
        Game.SetState(GAME_STATE_DISABLED);

        m_CanClose = false;
        
        const audio = Sound.Play("audioOutroStart");
        Sound.Timeline(audio, m_TimelineOutroStart);

        if (SKIP_OUTRO_ANIM && Debug.IsDev())
            audio.currentTime = audio.duration - 0.1;
    });

    function OnEachFrame()
    {
        let timeSlice = 1;
        if (m_TimePrev >= 0)
        {
            const timeNow = Date.now();
            timeSlice = (timeNow - m_TimePrev) * INERTIA_DEFAULT;
            m_TimePrev = timeNow;
        }

        let posX = Lerp(m_Heart.getAttribute("x"), m_TargetPos.x, timeSlice);
        let posY = Lerp(m_Heart.getAttribute("y"), m_TargetPos.y, timeSlice);

        m_Heart.setAttribute("x", posX);
        m_Heart.setAttribute("y", posY);

        m_Tiles.setAttribute("x", posX);
        m_Tiles.setAttribute("y", posY);
        
        if (m_TimePrev >= 0)
            requestAnimationFrame(OnEachFrame);
    }

    function OnGameDragStart(ev)
    {
        if (m_CanClose)
        {
            //--- Close
            CloseOutro();
        }
        else
        {
            //--- Drag heart
            let onHeart = false;
            let element = Game.GetSVGDoc().elementFromPoint(ev.clientX, ev.clientY);
            while (element)
            {
                if (element == m_Heart)
                {
                    onHeart = true;
                    break;
                }
                element = element.parentElement;
            }
            if (!onHeart)
                return;

            m_Drag.isActive = true;
            m_Drag.x = parseInt(m_Heart.getAttribute("x"));
            m_Drag.y = parseInt(m_Heart.getAttribute("y"));
            
            m_TargetPos.x = m_Drag.x;
            m_TargetPos.y = m_Drag.y;

            //Sound.Play("audioTileDragStart");
            Vibrate(VIBRATION_OUTRO_DRAG_START);
        }
    }
    
    function OnGameDrag(ev)
    {
        if (!m_Drag.isActive)
            return;
        
        let viewBox = Camera.GetViewBox();
        let coef = Math.min((viewBox.w / window.innerWidth), (viewBox.h / window.innerHeight)); //--- I have no idea what I'm doing
        m_TargetPos.x = m_Drag.x - (Game.GetClickPos()[0] - ev.clientX) * coef;
        m_TargetPos.y = m_Drag.y - (Game.GetClickPos()[1] - ev.clientY) * coef;
        
        if (CanSnapHeart())
        {
            m_TargetPos.x = m_FinalPos.x;
            m_TargetPos.y = m_FinalPos.y;

            if (!m_Snapped)
            {
                m_Snapped = true;
                Sound.Play("audioTileSnapStart");
            }
        }
        else if (m_Snapped)
        {
            m_Snapped = false;
            Sound.Play("audioTileSnapEnd");
        }
    }
    
    function OnGameDragEnd(ev)
    {
        if (!m_Drag.isActive)
            return;

        m_Drag.isActive = false;

        if (CanSnapHeart())
        {
            //--- Confirm
            m_TargetPos.x = m_FinalPos.x;
            m_TargetPos.y = m_FinalPos.y;

            m_CanClose = false;
            Game.SetState(GAME_STATE_DISABLED);

            window.removeEventListener(EVENT_GAME_DRAG, OnGameDrag);
            window.removeEventListener(EVENT_GAME_DRAG_END, OnGameDragEnd);

            Sound.Timeline(Sound.Play("audioOutroName"), m_TimelineOutroName);
            Vibrate(VIBRATION_OUTRO_CONFIRMED);
        }
        else
        {
            m_TargetPos.x = 0;
            m_TargetPos.y = 0;

            //Sound.Play("audioTileDragEnd");
            Vibrate(VIBRATION_OUTRO_DRAG_END);
        }
    }

    function CloseOutro()
    {
        Camera.EnableManualInput(true);
        //Camera.SetCamera(0, 0, OUTRO_ZOOM_VALUE, 0);
        Camera.SetCamera(0, 0, CREDITS_ZOOM_VALUE, 2); //--- Offset down to show the constellation

        //--- Exit full screen after camera animation ends
        setTimeout(() =>
        {
            if (document.fullscreenElement)
                document.exitFullscreen();
        }, 500);

        const outroContinue = document.getElementById("outroContinue");
        SetElementVisible(outroContinue, false);
        
        const tiles = Tile.GetTiles();
        for (let i = 0; i < tiles.length; i++)
        {
            if (i != 1)
            {
                tiles[i].classList.remove("animOutroTileOut");
                tiles[i].classList.add("animOutroTileIn");
            }
        }

        document.getElementById("outroName").classList.add("animOutroOut");

        SetElementVisible(document.getElementById("creditsArea"), true);

        window.removeEventListener(EVENT_GAME_DRAG_START, OnGameDragStart);
        Game.SetFinished();
    }

    function CanSnapHeart()
    {
        return Math.abs(m_TargetPos.x - m_FinalPos.x) < 150 && Math.abs(m_TargetPos.y - m_FinalPos.y) < 150;
    }

    function EnableControlTiles()
    {
        Game.SetState(GAME_STATE_DEFAULT);
        m_Tiles.removeEventListener("animationstart", EnableControlTiles);
    }

    function ShowLetter(index)
    {
        m_NameLetters[index].classList.add("animOutroNameLetter");
        SetElementVisible(m_NameLetters[index], true);
        Vibrate(VIBRATION_OUTRO_LETTER);
    }
}