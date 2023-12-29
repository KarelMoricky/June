var Camera = new function()
{
    const INERTIA_DEFAULT = 0.007;
    const INERTIA_DRAG = 0.05;
    const INERTIA_DISTANCE_COEF = 4;

    var m_ClickViewBox = [];
    var m_CurrentPos = [];
    var m_TargetPos = [];
    var m_Velocity = [];
    var m_TimePrev = 0;
    var m_InertiaStrength = INERTIA_DEFAULT;

    window.addEventListener(EVENT_GAME_INIT, OnGameInit);
    window.addEventListener(EVENT_GAME_DRAG_START, OnGameDragStart);
    window.addEventListener(EVENT_GAME_DRAG, OnGameDrag);
    window.addEventListener(EVENT_GAME_DRAG_END, OnGameDragEnd);

    this.MoveCameraScreen = function(posX, posY)
    {
        let viewBox = GetViewBox(Game.GetGame());
        let coef = Math.min((viewBox[2] / window.innerWidth), (viewBox[3] / window.innerHeight)); //--- I have no idea what I'm doing
        m_TargetPos = [
            viewBox[0] + (posX - window.innerWidth * 0.5) * coef,
            viewBox[1] + (posY - window.innerHeight * 0.5) * coef
        ];
    }
    this.MoveCameraGame = function(posX, posY)
    {
        const transform = new DOMPointReadOnly(posX, posY).matrixTransform(Game.GetGame().getScreenCTM());
        Camera.MoveCameraScreen(transform.x, transform.y);
    }

    function OnGameInit()
    {
        requestAnimationFrame(OnEachFrame);

        Game.GetSVG().addEventListener("keydown", (ev) => {
            if (ev.keyCode == 27)
            {
                //--- Escape
                Camera.MoveCameraGame(0, 0);
            }
            if (ev.keyCode == 187 || ev.keyCode == 189)
            {
                //--- +/-
                let zoom = 0.7;
                if (ev.keyCode == 189)
                    zoom = 1 / zoom;

                let posW = m_ClickViewBox[2];
                let posH = m_ClickViewBox[3];

                m_ClickViewBox[2] = m_ClickViewBox[2] * zoom;
                m_ClickViewBox[3] = m_ClickViewBox[3] * zoom;

                // console.log(m_ClickViewBox[2], posW);
                // console.log(m_ClickViewBox[3], posH);

                // m_CurrentPos[0] = m_ClickViewBox[0] + (-m_ClickViewBox[2] + posW) / 2;
                // m_CurrentPos[1] = m_ClickViewBox[1] + (-m_ClickViewBox[3] + posH) / 2;
                // m_TargetPos[0] = m_CurrentPos[0];
                // m_TargetPos[1] = m_CurrentPos[1];
            }
        });

        Game.GetSVG().addEventListener("dblclick", (ev) => {
            Camera.MoveCameraScreen(ev.clientX, ev.clientY);
        });
    }

    //requestAnimationFrame(OnEachFrame);
    function OnEachFrame()
    {
        let timeNow = Date.now();
        let timeSlice = (timeNow - m_TimePrev) * m_InertiaStrength;
        m_TimePrev = timeNow;

        if (m_ClickViewBox.length > 0 && m_TargetPos.length > 0)
        {
            m_CurrentPos[0] = Lerp(m_CurrentPos[0], m_TargetPos[0], timeSlice);
            m_CurrentPos[1] = Lerp(m_CurrentPos[1], m_TargetPos[1], timeSlice);

            let viewBox = [
                m_CurrentPos[0],
                m_CurrentPos[1],
                m_ClickViewBox[2],
                m_ClickViewBox[3]
            ];
            SetViewBox(Game.GetGame(), viewBox);
         }
        
        requestAnimationFrame(OnEachFrame);
    }

    function OnGameDragStart(ev)
    {
        if (Tile.GetSelected())
            return;

        m_ClickViewBox = GetViewBox(Game.GetGame());

        m_InertiaStrength = INERTIA_DRAG;
        m_CurrentPos[0] = m_ClickViewBox[0];
        m_CurrentPos[1] = m_ClickViewBox[1];
    }
    
    function OnGameDrag(ev)
    {
        if (Tile.GetSelected())
            return;
        
        let coef = Math.min((m_ClickViewBox[2] / window.innerWidth), (m_ClickViewBox[3] / window.innerHeight)); //--- I have no idea what I'm doing
        m_TargetPos = [
            m_ClickViewBox[0] + (Game.GetClickPos()[0] - ev.clientX) * coef,
            m_ClickViewBox[1] + (Game.GetClickPos()[1] - ev.clientY) * coef
        ];
        ClampTargetPos();

        m_Velocity[0] = m_TargetPos[0] - m_CurrentPos[0];
        m_Velocity[1] = m_TargetPos[1] - m_CurrentPos[1];

        Game.GetSVG().setAttribute("class", GAME_STATE_MOVE);
    }

    function OnGameDragEnd(ev)
    {
        if (Tile.GetSelected())
            return;

        if (m_Velocity.length == 2)
        {
            m_TargetPos[0] = m_CurrentPos[0] + m_Velocity[0] * INERTIA_DISTANCE_COEF;
            m_TargetPos[1] = m_CurrentPos[1] + m_Velocity[1] * INERTIA_DISTANCE_COEF;
            ClampTargetPos();
        }
        m_Velocity = [];

        m_InertiaStrength = INERTIA_DEFAULT;

        Game.GetSVG().setAttribute("class", GAME_STATE_DEFAULT);
    }

    function ClampTargetPos()
    {
        m_TargetPos[0] = Clamp(m_TargetPos[0], -Game.GetViewBox()[2], 0);
        m_TargetPos[1] = Clamp(m_TargetPos[1], -Game.GetViewBox()[3], 0);
    }
}

function GetViewBox(element)
{
    let viewBoxStr = element.getAttribute("viewBox").split(" ");
    let viewBox = [];
    for (let i = 0; i < viewBoxStr.length; i++)
    {
        viewBox[i] = parseInt(viewBoxStr[i]);
    }
    return viewBox;
}

function SetViewBox(element, viewBox)
{
    element.setAttribute("viewBox", viewBox[0] + " " + viewBox[1] + " " + viewBox[2] + " " + viewBox[3]);
}