var Game = new function()
{
    //#region Variables

    //--- IDs
    const ID_OBJECT = "gameObject";
    const ID_GAME = "game";
    const ID_CURSOR = "cursor";
    const ID_CIRCLE = "circle";

    //--- Variables
    var m_SvgDoc;
    var m_Svg;
    var m_Game;
    var m_Circle;
    var m_Cursor;
    var m_IsFinished;

    var m_Click = {id: -1, isActive: false, pos: []};
    var m_DefaultViewBox = [];
    //#endregion

    //#region Public functions

    this.GetGame = function()
    {
        return m_Game;
    }

    this.GetSVG = function()
    {
        return m_Svg;
    }

    this.GetSVGDoc = function()
    {
        return m_SvgDoc;
    }

    this.GetState = function(state)
    {
        return m_Svg.getAttribute("class");
    }
    
    this.SetState = function(state)
    {
        m_Svg.setAttribute("class", state);
    }

    this.MoveDebugCircle = function(posX, posY)
    {
        if (m_Circle)
        {
            m_Circle.setAttribute("cx", posX);
            m_Circle.setAttribute("cy", posY);
        }
    }

    this.GetClickPos = function()
    {
        return m_Click.pos;
    }

    this.GetDefaultViewBox = function()
    {
        return m_DefaultViewBox;
    }

    this.GetCurrentViewBox = function()
    {
        let viewBoxStr = m_Game.getAttribute("viewBox").split(" ");
        let viewBox = [];
        for (let i = 0; i < viewBoxStr.length; i++)
        {
            viewBox[i] = parseInt(viewBoxStr[i]);
        }
        return viewBox;
    }

    this.ToGameCoords = function(posX, posY)
    {
        return new DOMPointReadOnly(posX, posY).matrixTransform(m_Game.getScreenCTM().inverse());
    }

    this.FromGameCoords = function(posX, posY)
    {
        return new DOMPointReadOnly(posX, posY).matrixTransform(m_Game.getScreenCTM());
    }

    this.SetFinished = function()
    {
        m_IsFinished = true;
    }
    //#endregion

    //#region Init

    window.addEventListener("load", () =>
    {
        let object = document.getElementById(ID_OBJECT);
        m_SvgDoc = object.contentDocument;
        if (!m_SvgDoc)
        {
            alert("Error when loading Game SVG!");
            return;
        }

        m_Svg = m_SvgDoc.firstElementChild;
        m_Game = m_SvgDoc.getElementById(ID_GAME);
        m_Circle = m_SvgDoc.getElementById(ID_CIRCLE);
        m_Cursor = m_SvgDoc.getElementById(ID_CURSOR);

        m_Svg.addEventListener("pointerdown", OnPointerDown);
        m_Svg.addEventListener("pointerup", OnPointerUp);
        document.addEventListener("fullscreenchange", OnFullScreenChange);

        //--- Get game dimensions
        m_DefaultViewBox = Game.GetCurrentViewBox();
        
        //--- Skip intro animation
        if (Debug.IsDev() && Debug.SkipIntro())
            object.style.animationDelay = "0s";

        window.dispatchEvent(new Event(EVENT_GAME_INIT));
    });

    window.addEventListener("beforeunload", (ev) =>
    {
        if (Debug.IsDev() || m_IsFinished || Intro.IsVisible())
            return;

        ev.preventDefault();
        ev.returnValue = 'Game progress will not be saved. Are you sure you want to leave?';
    });
    //#endregion

    //#region Events

    function OnPointerDown(ev)
    {
        if (m_Click.isActive && m_Click.id != -1)
            return;

        Tile.SetSelected(ev);

        m_Click.isActive = true;
        m_Click.id = ev.pointerId;
        m_Click.pos = [ev.clientX, ev.clientY];
        m_Svg.addEventListener("pointermove", OnPointerMove);

        window.dispatchEvent(new PointerEvent(EVENT_GAME_DRAG_START, ev));
    }

    function OnPointerMove(ev)
    {
        if (!m_Click.isActive || ev.pointerId != m_Click.id)
            return;

        window.dispatchEvent(new PointerEvent(EVENT_GAME_DRAG, ev));
    }

    function OnPointerUp(ev)
    {
        if (!m_Click.isActive || ev.pointerId != m_Click.id)
            return;

        window.dispatchEvent(new PointerEvent(EVENT_GAME_DRAG_END, ev));

        ClearClick();
    }

    function OnFullScreenChange(ev)
    {
        //--- #HACK: When exiting full-screen by dragging from right on Android,
        //--- OnPointerDown is called, but OnPointerUp is not, leaving m_Click stuck.
        //--- This resets the value.
        ClearClick();
    }

    function ClearClick()
    {
        m_Click.isActive = false;
        m_Click.id = -1;
        m_Click.pos = [];
        m_Svg.removeEventListener("pointermove", OnPointerMove);
    }
    //#endregion
}