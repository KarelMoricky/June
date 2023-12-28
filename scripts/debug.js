const ALLOW_DEV_MODE = true;
const ID_LOG = "log";
const ID_POS = "pos";

var m_IsDev = false;
var m_Log = null;
var m_Pos = null;

window.addEventListener("load", OnLoadDebug);
function OnLoadDebug()
{
    m_Log = document.getElementById(ID_LOG);
    m_Pos = document.getElementById(ID_POS);

    m_IsDev = ALLOW_DEV_MODE && window.location.href.startsWith("http://127.0.0.1");
    if (m_IsDev)
    {
        document.title = "[DEV] " + document.title;

        window.addEventListener("pointermove", OnPointerMove);
    }
}

function Log()
{
    if (!m_IsDev)
        return;

    var now = new Date().toTimeString().slice(0,8);
    let text = "<small style='color: grey;'>[" + now + "]</small>";
    for (let i = 0; i < arguments.length; i++)
    {
        //if (i > 0)
            text += "<br />";

        text += arguments[i];
    }
    m_Log.innerHTML = text;
}
function LogPos(ev)
{
    const transform = new DOMPointReadOnly(ev.clientX, ev.clientY).matrixTransform(m_Game.getScreenCTM().inverse());
    m_Pos.innerHTML = "x: " + Math.round(transform.x) + "<br />y: " + Math.round(transform.y);
}