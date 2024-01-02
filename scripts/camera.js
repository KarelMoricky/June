var Camera = new function()
{
    const INERTIA_DEFAULT = 0.007;
    const INERTIA_DRAG = 0.05;
    const INERTIA_DISTANCE_COEF = 4;

    var m_Current = {x: 0, y: 0, zoom: 1};
    var m_Target = {x: 0, y: 0, zoom: 1};

    var m_Velocity = {x: 0, y: 0};
    var m_ClickPos = {x: 0, y: 0};
    var m_ClickScreen = {x: 0, y: 0};

    var m_ViewBox = {x: 0, y: 0, w: 0, h: 0};
    var m_ViewBoxDef = {x: 0, y: 0, w: 0, h: 0, limitW: 0, limitH: 0};

    var m_Anim = {x: 0, y: 0, zoom: 1, duration: 0, progress: 0, playing: false};

    var m_TimePrev = 0;
    var m_InertiaStrength = INERTIA_DEFAULT;
    //#region Public functions
    this.SetCamera = function(posX, posY, zoom, duration)
    {
        if (m_Anim.playing)
            return;

        if (posX != -1)
            m_Target.x = posX;
        
        if (posY != -1)
            m_Target.y = posY;

        if (zoom != -1)
            m_Target.zoom = zoom;

        if (duration > 0)
        {
            m_Anim.x = m_Current.x;
            m_Anim.y = m_Current.y;
            m_Anim.zoom = m_Current.zoom;

            m_Anim.duration = duration;
            m_Anim.progress = 0;
            m_Anim.playing = true;
        }
    }

    this.IsAnimPlaying = function()
    {
        return m_Anim.playing;
    }
    //#endregion

    //#region Calculation
    function Apply()
    {
        m_Current.x = Clamp(m_Current.x, -m_ViewBoxDef.limitW, m_ViewBoxDef.limitW);
        m_Current.y = Clamp(m_Current.y, -m_ViewBoxDef.limitH, m_ViewBoxDef.limitH);

        //--- Size
        m_ViewBox.w = m_Current.zoom * m_ViewBoxDef.w;
        m_ViewBox.h = m_Current.zoom * m_ViewBoxDef.h;
        
        //--- Pos
        m_ViewBox.x = m_Current.x - m_ViewBox.w * 0.5;
        m_ViewBox.y = m_Current.y - m_ViewBox.h * 0.5;

        //--- Apply
        //console.log("Apply", m_Current, m_ViewBox, m_ViewBoxDef);
        Game.GetGame().setAttribute("viewBox", `${m_ViewBox.x} ${m_ViewBox.y} ${m_ViewBox.w} ${m_ViewBox.h}`);
    }

    function Click(ev)
    {
        m_ClickScreen.x = ev.clientX;
        m_ClickScreen.y = ev.clientY;

        m_ClickPos.x = m_Current.x;
        m_ClickPos.y = m_Current.y;
    }
    //#endregion

    //#region Events

    window.addEventListener(EVENT_GAME_INIT, OnGameInit);
    window.addEventListener(EVENT_GAME_DRAG_START, OnGameDragStart);
    window.addEventListener(EVENT_GAME_DRAG, OnGameDrag);
    window.addEventListener(EVENT_GAME_DRAG_END, OnGameDragEnd);

    function OnGameDragStart(ev)
    {
        if (Tile.GetSelected() || m_Anim.playing)
            return;

        m_InertiaStrength = INERTIA_DRAG;

        Click(ev);
    }

    function OnGameDrag(ev)
    {
        if (Tile.GetSelected() || m_Anim.playing)
            return;

        let coef = Math.min((m_ViewBox.w / window.innerWidth), (m_ViewBox.h / window.innerHeight)); //--- I have no idea what I'm doing
        
        let transformClick = Game.FromGameCoords(m_ClickScreen.x * coef, m_ClickScreen.y * coef);
        let transformNow = Game.FromGameCoords(ev.clientX * coef, ev.clientY * coef);

        let diffX = (transformNow.x - transformClick.x) * coef;
        let diffY = (transformNow.y - transformClick.y) * coef;

        m_Target.x = m_ClickPos.x - diffX;
        m_Target.y = m_ClickPos.y - diffY;

        m_Velocity.x = m_Target.x - m_Current.x;
        m_Velocity.y = m_Target.y - m_Current.y;

        Game.GetSVG().setAttribute("class", GAME_STATE_MOVE);
    }

    function OnGameDragEnd(ev)
    {
        if (Tile.GetSelected() || m_Anim.playing)
            return;
        
        m_Target.x = m_Current.x + m_Velocity.x * INERTIA_DISTANCE_COEF;
        m_Target.y = m_Current.y + m_Velocity.y * INERTIA_DISTANCE_COEF;
        m_Velocity.x = m_Velocity.y = 0;

        m_InertiaStrength = INERTIA_DEFAULT;

        Game.GetSVG().setAttribute("class", GAME_STATE_DEFAULT);
    }

    function OnEachFrame()
    {
        let timeNow = Date.now();
        let timeSlice = (timeNow - m_TimePrev);
        m_TimePrev = timeNow;

        //--- Position
        if (m_Anim.playing)
        {
            //--- Animation
            let progress = 1;
            if (m_Anim.progress < 1)
            {
                progress = SmoothStep(m_Anim.progress);
                m_Anim.progress += timeSlice * 0.001 / m_Anim.duration;
            }
            else
            {
                m_Anim.playing = false;
            }

            m_Current.x = Lerp(m_Anim.x, m_Target.x, progress);
            m_Current.y = Lerp(m_Anim.y, m_Target.y, progress);
            m_Current.zoom = Lerp(m_Anim.zoom, m_Target.zoom, progress);
        }
        else
        {
            //--- Dragging
            let progress = timeSlice * m_InertiaStrength;
            m_Current.x = Lerp(m_Current.x, m_Target.x, progress);
            m_Current.y = Lerp(m_Current.y, m_Target.y, progress);
            m_Current.zoom = Lerp(m_Current.zoom, m_Target.zoom, progress);
        }

        Apply();
        
        requestAnimationFrame(OnEachFrame);
    }

    function OnGameInit()
    {
        let viewBox = Game.GetDefaultViewBox();

        m_ViewBox.x = m_ViewBoxDef.x = viewBox[0];
        m_ViewBox.y = m_ViewBoxDef.y = viewBox[1];
        m_ViewBox.w = m_ViewBoxDef.w = viewBox[2];
        m_ViewBox.h = m_ViewBoxDef.h = viewBox[3];

        m_ViewBoxDef.limitW = m_ViewBoxDef.w * 0.5;
        m_ViewBoxDef.limitH = m_ViewBoxDef.h * 0.5;

        m_Current.x = m_ViewBox.x + m_ViewBox.w * 0.5;
        m_Current.y = m_ViewBox.y + m_ViewBox.h * 0.5;

        m_Target.x = m_Current.x;
        m_Target.y = m_Current.y;
        
        Game.GetSVG().addEventListener("keydown", (ev) => {
            if (ev.keyCode == 27)
            {
                //--- Escape
                Camera.SetCamera(0, 0, 1);
            }
            if (ev.keyCode == 187 || ev.keyCode == 189)
            {
                //--- +/-
                if (ev.keyCode == 189)
                    m_Target.zoom *= 2;
                else
                    m_Target.zoom /= 2;
            }
        });

        requestAnimationFrame(OnEachFrame);
    }
    //#endregion
}