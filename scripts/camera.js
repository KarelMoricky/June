window.addEventListener("onGameInit", InitCamera);

function InitCamera()
{
    m_Svg.addEventListener("pointerdown", OnCameraPointerDown);
    m_Svg.addEventListener("pointerup", OnCameraPointerUp);

    //requestAnimationFrame(OnEachFrame);
    var m_Counter = 0;
    function OnEachFrame()
    {
        m_Counter++;
        console.log(m_Counter);
        
        requestAnimationFrame(OnEachFrame);
    }

    function OnCameraPointerDown(ev)
    {
        console.log("Cam down");
        m_Svg.addEventListener("pointermove", OnCameraPointerMove);
    }
    function OnCameraPointerMove(ev)
    {
        console.log("Cam move");
    }
    function OnCameraPointerUp(ev)
    {
        console.log("Cam up");
        m_Svg.removeEventListener("pointermove", OnCameraPointerMove);
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