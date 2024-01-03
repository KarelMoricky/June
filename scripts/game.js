var Game = new function()
{
    //#region Variables

    //--- IDs
    const ID_OBJECT = "gameObject";
    const ID_GAME = "game";
    const ID_CURSOR = "cursor";
    const ID_CIRCLE = "circle";
    const ID_LOADING = "loading";

    //--- Variables
    var m_SvgDoc;
    var m_Svg;
    var m_Game;
    var m_Circle;
    var m_Cursor;

    var m_Click = -1;
    var m_ClickPos = [];
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
        return m_ClickPos;
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
    
    this.SetCurrentViewBox = function(viewBox)
    {
        m_Game.setAttribute("viewBox", viewBox[0] + " " + viewBox[1] + " " + viewBox[2] + " " + viewBox[3]);
    }

    this.ToGameCoords = function(posX, posY)
    {
        return new DOMPointReadOnly(posX, posY).matrixTransform(m_Game.getScreenCTM().inverse());
    }

    this.FromGameCoords = function(posX, posY)
    {
        return new DOMPointReadOnly(posX, posY).matrixTransform(m_Game.getScreenCTM());
    }
    //#endregion

    //#region Init

    //--- Show loading screen (hidden by default so it's not shown if JavaScript is disabled)
    let loading = document.getElementById(ID_LOADING);
    loading.setAttribute("class", "");

    let playText = document.getElementById("play");
    playText.setAttribute("class", "");

    window.addEventListener("load", OnLoad);
    function OnLoad()
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

        if (!Debug.IsDev() || !DEV_FOREVER_LOAD)
        {
            //--- Hide loading
            OnLoadFinished();
        }

        if (DEV_FOREVER_LOAD)
        {
            let loading = document.getElementById(ID_LOADING);
            loading.addEventListener("click", OnLoadFinished);
        }

        //--- Get game dimensions
        m_DefaultViewBox = Game.GetCurrentViewBox();

        window.dispatchEvent(new Event(EVENT_GAME_INIT));
    }

    function OnLoadFinished()
    {
        SetElementVisible(document.getElementById("playText"), true);
        SetElementVisible(document.getElementById(ID_LOADING), false);

        let play = document.getElementById("playButton");
        play.disabled = false;
    }

    window.addEventListener("beforeunload", OnBeforeUnload);
    function OnBeforeUnload(ev)
    {
        if (Debug.IsDev())
            return;

        ev.preventDefault();
        ev.returnValue = 'Game progress will not be saved. Are you sure you want to leave?';
    }
    //#endregion

    //#region Events

    function OnPointerDown(ev)
    {
        if (m_Click != -1)
            return;

        Tile.SetSelected(ev);

        m_Click = ev.pointerId;
        m_ClickPos = [ev.clientX, ev.clientY];
        m_Svg.addEventListener("pointermove", OnPointerMove);

        window.dispatchEvent(new PointerEvent(EVENT_GAME_DRAG_START, ev));
    }

    function OnPointerMove(ev)
    {
        if (ev.pointerId != m_Click)
            return;

        window.dispatchEvent(new PointerEvent(EVENT_GAME_DRAG, ev));
    }

    function OnPointerUp(ev)
    {
        if (ev.pointerId != m_Click)
            return;

        m_Click = -1;
        m_Svg.removeEventListener("pointermove", OnPointerMove);

        window.dispatchEvent(new PointerEvent(EVENT_GAME_DRAG_END, ev));
    }
    //#endregion
}