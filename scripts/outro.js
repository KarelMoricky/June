var Outro = new function()
{
    const INERTIA_DEFAULT = 0.02;
    
    const OUTRO_MOVE_DELAY = 0.25; //--- How long before camera animation starts
    const OUTRO_ZOOM_LENGTH = 5; //--- Time for camera to zoom out during outro
    const OUTRO_ZOOM_VALUE = 3.5; //--- Camera zoom factor

    let m_CanClose = false;
    let m_Heart = null;
    let m_HeartTarget = null;
    let m_Drag = {x: 0, y: 0, isActive: false};
    let m_TargetPos = {x: 0, y: 0};
    let m_FinalPos = {x: 0, y: 0};
    let m_TimePrev = 0;

    window.addEventListener(EVENT_GAME_INIT, (ev) =>
    {
        SetStyleVariable("--outro-zoom-out", OUTRO_ZOOM_LENGTH + "s");

        m_Heart = Game.GetSVGDoc().getElementById("heart");
        m_HeartTarget = Game.GetSVGDoc().getElementById("heartTarget");

        m_FinalPos.x = parseInt(m_HeartTarget.getAttribute("x"));
        m_FinalPos.y = parseInt(m_HeartTarget.getAttribute("y"));
    });

    window.addEventListener(EVENT_TILE_CONFIRMED, (ev) =>
    {
        if (!ev.detail.isManual || !ev.detail.isLast)
            return;
        
        Camera.EnableManualInput(false);
        Camera.SetCamera(m_FinalPos.x, m_FinalPos.y, OUTRO_ZOOM_VALUE, OUTRO_ZOOM_LENGTH, OUTRO_MOVE_DELAY);

        const tiles = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
        tiles.classList.add("animTilesOut");

        const grid = Game.GetSVGDoc().getElementById("grid");
        grid.classList.add("animGridOut");

        const outro = Game.GetSVGDoc().getElementById("outro");
        SetElementVisible(outro, true);

        const outroBox = document.getElementById("outroBox");
        SetElementVisible(outroBox, true);

        m_CanClose = false;
        /*
        new Promise((resolve) => setTimeout(resolve, 10000)).then(() => {
            m_CanClose = true;
        });
        */
       
        window.addEventListener(EVENT_GAME_DRAG_START, OnGameDragStart);
        window.addEventListener(EVENT_GAME_DRAG, OnGameDrag);
        window.addEventListener(EVENT_GAME_DRAG_END, OnGameDragEnd);
        requestAnimationFrame(OnEachFrame);
    });

    function OnEachFrame()
    {
        const timeNow = Date.now();
        let timeSlice = (timeNow - m_TimePrev) * INERTIA_DEFAULT;
        m_TimePrev = timeNow;

        let posX = Lerp(m_Heart.getAttribute("x"), m_TargetPos.x, timeSlice);
        let posY = Lerp(m_Heart.getAttribute("y"), m_TargetPos.y, timeSlice);

        m_Heart.setAttribute("x", posX);
        m_Heart.setAttribute("y", posY);
         
        requestAnimationFrame(OnEachFrame);
    }

    function OnGameDragStart(ev)
    {
        if (m_CanClose)
        {
            //--- Close
            Camera.EnableManualInput(true);
            Camera.SetCamera(0, 0, 1, 0.5);
            
            const tiles = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
            tiles.classList.remove("animTilesOut");
            tiles.classList.add("animTilesIn");

            const grid = Game.GetSVGDoc().getElementById("grid");
            grid.classList.remove("animTilesOut");
            grid.classList.add("animTilesIn");

            const outroBox = document.getElementById("outroBox");
            outroBox.classList.remove("animOutroIn");
            outroBox.classList.add("animOutroOut");
            
            m_Heart.classList.remove("animHeartIn");
            m_Heart.classList.add("animHeartOut");

            const thanks = document.getElementById("thanks");
            SetElementVisible(thanks, true);

            Game.SetFinished();
        }
        else
        {
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
    }
    
    function OnGameDragEnd(ev)
    {
        if (!m_Drag.isActive)
            return;

        m_Drag.isActive = false;

        if (Math.abs(m_TargetPos.x - m_FinalPos.x) < 150 && Math.abs(m_TargetPos.y - m_FinalPos.y) < 150)
        {
            console.log("CONFIRMED");
            m_TargetPos.x = m_FinalPos.x;
            m_TargetPos.y = m_FinalPos.y;

            m_HeartTarget.classList.remove("animTargetHeartIn");
            m_HeartTarget.classList.add("animHeartOut");

            //m_CanClose = true;
            //window.removeEventListener(EVENT_GAME_DRAG_START, OnGameDragStart);
            window.removeEventListener(EVENT_GAME_DRAG, OnGameDrag);
            window.removeEventListener(EVENT_GAME_DRAG_END, OnGameDragEnd);
        }
        else
        {
            m_TargetPos.x = 0;
            m_TargetPos.y = 0;
        }
    }

    // function OnKeyDown(ev)
    // {
    //     //--- Cheat combination
    //     if (!ev.ctrlKey || !ev.shiftKey)
    //         return;

    //     if (ev.key == "E")
    //     {
    //         //--- [E] Outro
    //         SetStyleVariable("--outro-zoom-out", "0");
    //         let ev = new CustomEvent(EVENT_TILE_CONFIRMED,{detail: {
    //             tile: null,
    //             isLast: true,
    //             isManual: true
    //         }});
    //         window.dispatchEvent(ev);
    //     }
    // }
}