var Camera = new function()
{
    const INERTIA_DEFAULT = 0.007;
    const INERTIA_DRAG = 0.05;
    const INERTIA_DISTANCE_COEF = 4;

    var m_ClickViewBox = [];
    var m_CurrentPos = [];
    var m_TargetPos = [];
    var m_Velocity = [];
    var m_CurrentZoom = 1;
    var m_TargetZoom = DEFAULT_ZOOM;
    var m_TimePrev = 0;
    var m_InertiaStrength = INERTIA_DEFAULT;
    var m_PosProgress = 0;
    var m_PosDuration = 0;

    window.addEventListener(EVENT_GAME_INIT, OnGameInit);
    window.addEventListener(EVENT_GAME_DRAG_START, OnGameDragStart);
    window.addEventListener(EVENT_GAME_DRAG, OnGameDrag);
    window.addEventListener(EVENT_GAME_DRAG_END, OnGameDragEnd);

    this.MoveCameraScreen = function(posX, posY)
    {
        let viewBox = Game.GetCurrentViewBox();
        let coef = Math.min((viewBox[2] / window.innerWidth), (viewBox[3] / window.innerHeight)); //--- I have no idea what I'm doing
        m_TargetPos = [
            viewBox[0] + (posX - window.innerWidth * 0.5) * coef,
            viewBox[1] + (posY - window.innerHeight * 0.5) * coef
        ];
    }

    this.MoveCameraGame = function(posX, posY, duration)
    {
        const transform = new DOMPointReadOnly(posX, posY).matrixTransform(Game.GetGame().getScreenCTM());
        Camera.MoveCameraScreen(transform.x, transform.y);

        if (duration > 0)
        {
            m_PosDuration = duration;
            m_PosProgress = 0;
        }
    }

    this.SetTargetZoom = function(zoom)
    {
        m_TargetZoom = zoom;
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
                if (ev.keyCode == 189)
                    m_TargetZoom *= 2;
                else
                    m_TargetZoom /= 2;
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
        let timeSlice = (timeNow - m_TimePrev);
        m_TimePrev = timeNow;

        if (Math.abs(m_CurrentZoom - m_TargetZoom) > 0.01)
        {
            var zoom = Lerp(m_CurrentZoom, m_TargetZoom, timeSlice * m_InertiaStrength);
            SetZoom(zoom);
        }

        else if (m_ClickViewBox.length > 0 && m_TargetPos.length > 0)// && Math.abs(m_CurrentPos[0] - m_TargetPos[0]) > 0.01 && Math.abs(m_CurrentPos[1] - m_TargetPos[1]) > 0.01)
        {
            let posX = 0;
            let posY = 0;
            if (m_PosDuration > 0)
            {
                //--- Animated movement
                if (m_PosProgress > 1)
                {
                    //--- Finished
                    m_PosProgress = 1;
                    m_PosDuration = 0;
                    m_CurrentPos[0] = m_TargetPos[0];
                    m_CurrentPos[1] = m_TargetPos[1];
                }

                let progress = SmoothStep(m_PosProgress);
                posX = Lerp(m_CurrentPos[0], m_TargetPos[0], progress);
                posY = Lerp(m_CurrentPos[1], m_TargetPos[1], progress);

                m_PosProgress += timeSlice * 0.001 / m_PosDuration;
            }
            else
            {
                //--- Targetted movement
                posX = Lerp(m_CurrentPos[0], m_TargetPos[0], timeSlice * m_InertiaStrength);
                posY = Lerp(m_CurrentPos[1], m_TargetPos[1], timeSlice * m_InertiaStrength);
                m_CurrentPos[0] = posX;
                m_CurrentPos[1] = posY;
            }

            //--- Apply
            let viewBox = [
                posX,
                posY,
                m_ClickViewBox[2],
                m_ClickViewBox[3]
            ];
            Game.SetCurrentViewBox(viewBox);
        }
        
        requestAnimationFrame(OnEachFrame);
    }

    function OnGameDragStart(ev)
    {
        if (Tile.GetSelected() || m_PosDuration)
            return;

        m_ClickViewBox = Game.GetCurrentViewBox();

        m_InertiaStrength = INERTIA_DRAG;
        m_CurrentPos[0] = m_ClickViewBox[0];
        m_CurrentPos[1] = m_ClickViewBox[1];
    }
    
    function OnGameDrag(ev)
    {
        if (Tile.GetSelected() || m_PosDuration)
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
        return;
        
        m_TargetPos[0] = Clamp(m_TargetPos[0], -Game.GetDefaultViewBox()[2], 0);
        m_TargetPos[1] = Clamp(m_TargetPos[1], -Game.GetDefaultViewBox()[3], 0);
    }

    function SetZoom(zoom)
    {
        m_CurrentZoom = zoom;

        if (m_ClickViewBox.length == 0);
            m_ClickViewBox = Game.GetCurrentViewBox();

        m_ClickViewBox[2] = Game.GetDefaultViewBox()[2] * m_CurrentZoom;
        m_ClickViewBox[3] = Game.GetDefaultViewBox()[3] * m_CurrentZoom;

        const transformGame = new DOMPointReadOnly(window.innerWidth * 0.5, window.innerHeight * 0.5).matrixTransform(Game.GetGame().getScreenCTM().inverse());
        Game.SetCurrentViewBox(m_ClickViewBox);

        Camera.MoveCameraGame(transformGame.x, transformGame.y);
        m_CurrentPos[0] = m_TargetPos[0];
        m_CurrentPos[1] = m_TargetPos[1];
    }
}