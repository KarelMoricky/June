const ALLOW_DEV_MODE = true;
const ID_LOG = "log";

var m_IsDev = false;
var m_Log = null;

window.addEventListener("load", OnLoadDebug);
function OnLoadDebug()
{
    m_Log = document.getElementById(ID_LOG);

    m_IsDev = ALLOW_DEV_MODE && window.location.href.startsWith("http://127.0.0.1");
    if (m_IsDev)
        document.title = "[DEV] " + document.title;
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