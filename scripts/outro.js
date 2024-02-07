var Outro = new function()
{
    const INERTIA_DEFAULT = 0.02;
    
    const OUTRO_MOVE_DELAY = 0.25; //--- How long before camera animation starts
    const OUTRO_ZOOM_LENGTH = 5; //--- Time for camera to zoom out during outro
    const OUTRO_ZOOM_VALUE = 3.5; //--- Camera zoom in outro
    const CREDITS_ZOOM_VALUE = 0.5; //--- Camera zoom at the end of the game

    let m_CanClose = false;
    let m_Tiles = null;
    let m_Heart = null;
    let m_HeartHint = null;
    let m_Drag = {x: 0, y: 0, isActive: false};
    let m_TargetPos = {x: 0, y: 0};
    let m_FinalPos = {x: 0, y: 0};
    let m_TimePrev = 0;
    let m_Snapped = false;

    window.addEventListener(EVENT_GAME_INIT, (ev) =>
    {
        SetStyleVariable("--outro-zoom-out", OUTRO_ZOOM_LENGTH + "s");

        m_Tiles = Game.GetSVGDoc().getElementById("tiles");
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
        Camera.SetCamera(m_FinalPos.x, m_FinalPos.y, OUTRO_ZOOM_VALUE, OUTRO_ZOOM_LENGTH, OUTRO_MOVE_DELAY);
        Game.SetState(GAME_STATE_DISABLED);

        const grid = Game.GetSVGDoc().getElementById("grid");
        grid.classList.add("animGridOut");

        m_Tiles.classList.add("animTilesCurrent");
        m_Tiles.addEventListener("animationstart", EnableControlTiles);

        SetElementVisible(m_Heart, true);
        SetElementVisible(m_HeartHint, true);

        m_CanClose = false;
        /*
        new Promise((resolve) => setTimeout(resolve, 10000)).then(() => {
            m_CanClose = true;
        });
        */
       
        PlayAudio("audioOutroStart");
       
        window.addEventListener(EVENT_GAME_DRAG_START, OnGameDragStart);
        window.addEventListener(EVENT_GAME_DRAG, OnGameDrag);
        window.addEventListener(EVENT_GAME_DRAG_END, OnGameDragEnd);
        requestAnimationFrame(OnEachFrame);
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
            Camera.EnableManualInput(true);
            Camera.SetCamera(0, 0, OUTRO_ZOOM_VALUE, 0);
            Camera.SetCamera(0, 0, CREDITS_ZOOM_VALUE, 0.5);
            
            m_Tiles.classList.remove("animTilesOut");
            m_Tiles.classList.add("animTilesIn");

            const grid = Game.GetSVGDoc().getElementById("grid");
            grid.classList.remove("animTilesOut");
            grid.classList.add("animTilesIn");

            document.getElementById("outroNote").classList.add("animOutroOut");
            document.getElementById("outroName").classList.add("animOutroOut");
            
            m_Heart.classList.remove("animHeartIn");
            m_Heart.classList.add("animHeartOut");

            SetElementVisible(document.getElementById("creditsArea"), true);

            m_TimePrev = -1;
            m_TargetPos.x = 0;
            m_TargetPos.y = 0;

            PlayAudio("audioOutroEnd");

            window.removeEventListener(EVENT_GAME_DRAG_START, OnGameDragStart);
            Game.SetFinished();
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

            PlayAudio("audioTileDragStart");
            Vibrate(VIBRATION_OUTRO_DRAG_START);
        }
    }
    
    function OnGameDrag(ev)
    {
        if (!m_Drag.isActive)
            return;
        
        let viewBox = Game.GetCurrentViewBox();
        let coef = Math.min((viewBox[2] / window.innerWidth), (viewBox[3] / window.innerHeight)); //--- I have no idea what I'm doing
        m_TargetPos.x = m_Drag.x - (Game.GetClickPos()[0] - ev.clientX) * coef;
        m_TargetPos.y = m_Drag.y - (Game.GetClickPos()[1] - ev.clientY) * coef;
        
        if (CanSnapHeart())
        {
            m_TargetPos.x = m_FinalPos.x;
            m_TargetPos.y = m_FinalPos.y;

            if (!m_Snapped)
            {
                m_Snapped = true;
                PlayAudio("audioTileSnapStart");
            }
        }
        else if (m_Snapped)
        {
            m_Snapped = false;
            PlayAudio("audioTileSnapEnd");
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

            m_Heart.classList.add("animHeartIn");
            m_Heart.classList.add("ignoreCursor");
            m_Heart.classList.remove("heartDraggable");

            m_HeartHint.classList.remove("animHeartHintIn");
            m_HeartHint.classList.add("animHeartOut");

            m_Tiles.classList.add("animTilesOut");

            SetElementVisible(Game.GetSVGDoc().getElementById("heartHighlight1"), true);
            SetElementVisible(Game.GetSVGDoc().getElementById("heartHighlight2"), true);
            SetElementVisible(Game.GetSVGDoc().getElementById("heartHighlight3"), true);

            const outroNote = document.getElementById("outroNote");
            SetElementVisible(outroNote, true);
            AnimateWords(outroNote, 1.5);

            const outroName = document.getElementById("outroName");
            SetElementVisible(outroName, true);
            const segments = AnimateLetters(outroName, 5, 0.7, "outroNameLetter");
            for (let segment of segments)
            {
                segment.addEventListener("animationstart", (event) =>
                {
                    Vibrate(VIBRATION_OUTRO_LETTER);
                });
            }

            m_CanClose = false;
            Game.SetState(GAME_STATE_DISABLED);
            segments[segments.length - 1].addEventListener("animationend", (event) =>
            {
                m_CanClose = true;
                Game.SetState(GAME_STATE_DEFAULT);
            });

            window.removeEventListener(EVENT_GAME_DRAG, OnGameDrag);
            window.removeEventListener(EVENT_GAME_DRAG_END, OnGameDragEnd);

            PlayAudio("audioOutroName");
            Vibrate(VIBRATION_OUTRO_CONFIRMED);
        }
        else
        {
            m_TargetPos.x = 0;
            m_TargetPos.y = 0;

            PlayAudio("audioTileDragEnd");
            Vibrate(VIBRATION_OUTRO_DRAG_END);
        }
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
}