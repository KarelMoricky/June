var Camera = new function()
{
    var m_ClickViewBox = [];

    window.addEventListe
    window.addEventListener("GameInit", OnGameInit);
    window.addEventListener("GameDragStart", OnGameDragStart);
    window.addEventListener("GameDrag", OnGameDrag);
    window.addEventListener("GameDragEnd", OnGameDragEnd);

    function OnGameInit()
    {
    }

    //requestAnimationFrame(OnEachFrame);
    var m_Counter = 0;
    function OnEachFrame()
    {
        m_Counter++;
        console.log(m_Counter);
        
        requestAnimationFrame(OnEachFrame);
    }

    function OnGameDragStart(ev)
    {
        if (Tile.GetSelected())
            return;

        m_ClickViewBox = GetViewBox(m_Game);
    }
    
    function OnGameDrag(ev)
    {
        if (Tile.GetSelected())
            return;

        let coef = Math.min((m_ClickViewBox[2] / window.innerWidth), (m_ClickViewBox[3] / window.innerHeight)); //--- I have no idea what I'm doing
        let viewBox = [
            m_ClickViewBox[0] + (Game.GetClickPos()[0] - ev.clientX) * coef,
            m_ClickViewBox[1] + (Game.GetClickPos()[1] - ev.clientY) * coef,
            m_ClickViewBox[2],
            m_ClickViewBox[3]
        ];
        SetViewBox(m_Game, viewBox);

        Game.GetSVG().setAttribute("class", GAME_STATE_MOVE);
    }

    function OnGameDragEnd(ev)
    {
        if (Tile.GetSelected())
            return;

        Game.GetSVG().setAttribute("class", GAME_STATE_DEFAULT);
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