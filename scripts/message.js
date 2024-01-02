const ID_MESSAGE_AREA = "messageArea";
const ID_MESSAGE_BOX = "messageBox";
const ID_BUTTON_PLAY = "playButton";
const ID_TIER_0_SEX = "tier0_sex";

var m_MessageArea = null;
var m_MessageBox = null;
var m_MessageBox = null;

window.addEventListener("load", OnLoadMessageBox);
function OnLoadMessageBox()
{
    m_MessageArea = document.getElementById(ID_MESSAGE_AREA);
    m_MessageBox = document.getElementById(ID_MESSAGE_BOX);

    let playButton = document.getElementById(ID_BUTTON_PLAY);
    playButton.addEventListener("click", OnButtonPlay);

    if (Debug.IsDev())
    {
        if (!DEV_FOREVER_LOAD)
            OnButtonPlay();

        let tier0_sex = document.getElementById(ID_TIER_0_SEX);
        tier0_sex.addEventListener("click", OnTier0Sex);
    }

    function OnButtonPlay()
    {
        SetElementVisible(m_MessageArea, false);

        //--- Switch to fullscreen
        if (!Debug.IsDev() || DEV_FOREVER_LOAD)
        {
            let docElm = document.documentElement;
            if (docElm.requestFullscreen)
                docElm.requestFullscreen();
            else if (docElm.mozRequestFullScreen)
                docElm.mozRequestFullScreen();
            else if (docElm.webkitRequestFullScreen)
                docElm.webkitRequestFullScreen();
            else if (docElm.msRequestFullscreen)
                docElm.msRequestFullscreen();
        }
            
        let ev = new CustomEvent(EVENT_PAUSE,{detail: {
            isPaused: false
        }});
        window.dispatchEvent(ev);
    }

    function OnTier0Sex(ev)
    {
        let tier0_sex = document.getElementById(ID_TIER_0_SEX);
        if (tier0_sex.innerHTML == "DAUGHTER")
            tier0_sex.innerHTML = "YOUNGER SON";
        else
          tier0_sex.innerHTML = "DAUGHTER";
    }
}