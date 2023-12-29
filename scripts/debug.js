var m_IsDev = DEV_MODE && window.location.href.startsWith("http://127.0.0.1");

var m_Log = document.getElementById("log");
var m_Pos = document.getElementById("pos");

if (m_IsDev)
{
    document.title = "[DEV] " + document.title;

    window.addEventListener("onGameInit", function InitDebug()
    {
        m_Svg.addEventListener("mousedown", LogPos);
    });
}

function Log()
{
    if (!m_IsDev)
        return;

    var now = new Date().toTimeString().slice(0,8);
    let text = "<small style='color: grey;'>[" + now + "]</small>";
    for (let i = 0; i < arguments.length; i++)
    {
        text += "<br />" + arguments[i];
    }
    m_Log.innerHTML = text;
}
function LogPos(ev)
{
    const transform = new DOMPointReadOnly(ev.clientX, ev.clientY).matrixTransform(m_Game.getScreenCTM().inverse());
    m_Pos.innerHTML = "x: " + Math.round(transform.x) + "<br />y: " + Math.round(transform.y);
}