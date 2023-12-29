var Game = new function()
{
    //#region Variables

    //--- IDs
    const ID_OBJECT = "gameObject";
    const ID_GAME = "game";
    const ID_CURSOR = "cursor";
    const ID_CIRCLE = "circle";
    const ID_LOADING = "loading";
    const ID_NOTES = "notes";

    //--- Variables
    var m_SvgDoc;
    var m_Svg;
    var m_Game;
    var m_Circle;
    var m_Cursor;
    var m_Notes;

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
    //#endregion

    //#region Init
    //--- Show loading screen (hidden by default so it's not shown if JavaScript is disabled)
    let loadingBox = document.getElementById(ID_LOADING);
    loading.setAttribute("class", "fullScreen");

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
        m_Notes = m_SvgDoc.getElementById(ID_NOTES);

        m_Svg.addEventListener("pointerdown", OnPointerDown);
        m_Svg.addEventListener("pointerup", OnPointerUp);

        if (!Debug.IsDev())
        {
            m_Svg.addEventListener("click", (ev) => {
                let docElm = document.documentElement;
                if (docElm.requestFullscreen)
                    docElm.requestFullscreen();
                else if (docElm.mozRequestFullScreen)
                    docElm.mozRequestFullScreen();
                else if (docElm.webkitRequestFullScreen)
                    docElm.webkitRequestFullScreen();
                else if (docElm.msRequestFullscreen)
                    docElm.msRequestFullscreen();
            });
        }

        if (!Debug.IsDev() || !DEV_FOREVER_LOAD)
        {
            //--- Show tutorial
            let tutorialView = m_SvgDoc.getElementById(ID_TUTORIAL_VIEW);
            tutorialView.setAttribute("class", "");

            let tutorialTile = m_SvgDoc.getElementById(ID_TUTORIAL_TILE);
            tutorialTile.setAttribute("class", "");

            //--- Hide loading
            let loading = document.getElementById(ID_LOADING);
            loading.setAttribute("class", "hidden");
        }

        //--- Get game dimensions
        m_DefaultViewBox = Game.GetCurrentViewBox();

        window.dispatchEvent(new Event(EVENT_GAME_INIT));
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