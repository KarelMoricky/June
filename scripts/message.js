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

    if (m_IsDev)
    {
        OnButtonPlay();
        //let tier0_sex = document.getElementById(ID_TIER_0_SEX);
        //tier0_sex.addEventListener("click", OnTier0Sex);
    }

    function OnButtonPlay()
    {
        m_MessageArea.setAttribute("class", "hidden");

        //--- Switch to fullscreen
        if (!m_IsDev)
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